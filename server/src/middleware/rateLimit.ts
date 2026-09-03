import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import type { AuthenticatedRequest } from "./auth";

export const planGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const auth = req as AuthenticatedRequest;
    return auth.userId ?? ipKeyGenerator(req.ip ?? "");
  },
  message: {
    error: "Too many plan generations. Please try again later.",
  },
});
