import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";

describe("POST /api/plan/generate rate limit", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as AuthenticatedRequest).userId = "user-123";
      next();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 after exceeding the limit", async () => {
    const { planGenerationLimiter } = await import("../middleware/rateLimit");

    app.post("/generate", planGenerationLimiter, (_req, res) => {
      res.json({ ok: true });
    });

    let status = 0;
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post("/generate");
      status = res.status;
    }

    expect(status).toBe(429);
  });
});
