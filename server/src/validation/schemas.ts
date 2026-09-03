import { z } from "zod";

export const profileSchema = z.object({
  goal: z.enum(["cut", "bulk", "recomp", "strength", "endurance"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(2).max(6),
  sessionLength: z.number().int().min(20).max(180),
  equipment: z.enum(["full_gym", "home", "dumbbells"]),
  injuries: z.string().max(500).optional().or(z.literal("")).transform((v) => (v || undefined)),
  preferredSplit: z.enum(["full_body", "upper_lower", "ppl", "custom"]),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const generatePlanSchema = z.object({});
