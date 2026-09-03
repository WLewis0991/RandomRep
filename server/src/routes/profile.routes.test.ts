import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user_profiles: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

import { profileRouter } from "./profile.routes";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AuthenticatedRequest).userId = "user-123";
    next();
  });
  app.use("/", profileRouter);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/profile", () => {
  it("upserts a profile with the verified userId", async () => {
    prismaMock.user_profiles.upsert.mockResolvedValue({});

    const body = {
      goal: "bulk",
      experience: "intermediate",
      daysPerWeek: 4,
      sessionLength: 60,
      equipment: "full_gym",
      preferredSplit: "upper_lower",
    };

    const res = await request(buildApp()).post("/").send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(prismaMock.user_profiles.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.user_profiles.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "user-123" },
        create: expect.objectContaining({ user_id: "user-123", days_per_week: 4 }),
        update: expect.objectContaining({ days_per_week: 4 }),
      }),
    );
  });

  it("rejects a request missing required fields", async () => {
    const res = await request(buildApp()).post("/").send({
      goal: "bulk",
    });

    expect(res.status).toBe(400);
    expect(prismaMock.user_profiles.upsert).not.toHaveBeenCalled();
  });
});
