import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";

const { prismaMock, generateTrainingPlanMock } = vi.hoisted(() => ({
  prismaMock: {
    user_profiles: {
      findUnique: vi.fn(),
    },
    training_plans: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
  generateTrainingPlanMock: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("../lib/ai", () => ({
  generateTrainingPlan: generateTrainingPlanMock,
}));

import { planRouter } from "./plan.routes";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AuthenticatedRequest).userId = "user-123";
    next();
  });
  app.use("/", planRouter);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /generate", () => {
  it("generates and stores a plan with the next version number", async () => {
    prismaMock.user_profiles.findUnique.mockResolvedValue({ user_id: "user-123" });
    prismaMock.training_plans.findFirst.mockResolvedValue({ version: 3 });
    generateTrainingPlanMock.mockResolvedValue({ overview: { goal: "Build" } });
    prismaMock.training_plans.create.mockResolvedValue({
      id: "plan-1",
      version: 4,
      created_at: new Date(),
    });

    const res = await request(buildApp()).post("/generate").send({});

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(4);
    expect(generateTrainingPlanMock).toHaveBeenCalledTimes(1);
    expect(prismaMock.training_plans.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user_id: "user-123",
          version: 4,
        }),
      }),
    );
  });

  it("starts at version 1 when no previous plan exists", async () => {
    prismaMock.user_profiles.findUnique.mockResolvedValue({ user_id: "user-123" });
    prismaMock.training_plans.findFirst.mockResolvedValue(null);
    generateTrainingPlanMock.mockResolvedValue({ overview: { goal: "Build" } });
    prismaMock.training_plans.create.mockResolvedValue({
      id: "plan-1",
      version: 1,
      created_at: new Date(),
    });

    const res = await request(buildApp()).post("/generate").send({});

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(1);
    expect(prismaMock.training_plans.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 1 }),
      }),
    );
  });

  it("returns 400 when the user has no profile", async () => {
    prismaMock.user_profiles.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).post("/generate").send({});

    expect(res.status).toBe(400);
    expect(prismaMock.training_plans.create).not.toHaveBeenCalled();
  });

  it("returns 500 when AI generation fails", async () => {
    prismaMock.user_profiles.findUnique.mockResolvedValue({ user_id: "user-123" });
    prismaMock.training_plans.findFirst.mockResolvedValue(null);
    generateTrainingPlanMock.mockRejectedValue(new Error("all models down"));

    const res = await request(buildApp()).post("/generate").send({});

    expect(res.status).toBe(500);
    expect(prismaMock.training_plans.create).not.toHaveBeenCalled();
  });
});

describe("GET /current", () => {
  it("returns the latest plan for the verified user", async () => {
    prismaMock.training_plans.findFirst.mockResolvedValue({
      id: "plan-9",
      user_id: "user-123",
      plan_json: { overview: { goal: "Build" } },
      plan_text: "{}",
      version: 2,
      created_at: new Date("2026-01-01"),
    });

    const res = await request(buildApp()).get("/current");

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(2);
    expect(res.body.planJson.overview.goal).toBe("Build");
    expect(prismaMock.training_plans.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-123" },
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("returns 404 when no plan exists", async () => {
    prismaMock.training_plans.findFirst.mockResolvedValue(null);

    const res = await request(buildApp()).get("/current");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Current plan not found");
  });
});
