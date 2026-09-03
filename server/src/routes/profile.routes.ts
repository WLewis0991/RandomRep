import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../validation/schemas.js";

export const profileRouter = Router();

profileRouter.post(
  "/",
  validate(profileSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.userId!;
      const {
        goal,
        experience,
        daysPerWeek,
        sessionLength,
        equipment,
        injuries,
        preferredSplit,
      } = req.body;

      await prisma.user_profiles.upsert({
        where: { user_id: userId },
        update: {
          goal,
          experience,
          days_per_week: daysPerWeek,
          session_length: sessionLength,
          equipment,
          injuries: injuries || null,
          preferred_split: preferredSplit,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          goal,
          experience,
          days_per_week: daysPerWeek,
          session_length: sessionLength,
          equipment,
          injuries: injuries || null,
          preferred_split: preferredSplit,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ error: "Failed to save profile" });
    }
  },
);