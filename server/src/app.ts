import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { profileRouter } from "./routes/profile.routes.js";
import { planRouter } from "./routes/plan.routes.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

export function createApp() {
  const app = express();

  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || "http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());

  // All API routes require authentication
  app.use("/api", requireAuth);

  // Routes
  app.use("/api/profile", profileRouter);
  app.use("/api/plan", planRouter);

  return app;
}
