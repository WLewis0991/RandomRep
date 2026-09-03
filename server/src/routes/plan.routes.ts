import { Router } from "express";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";
import type { AuthenticatedRequest } from "../middleware/auth";

export const planRouter = Router();

planRouter.post("/generate", async (req: AuthenticatedRequest, res) => {
    try{
        const userId = req.userId!;

        const profile = await prisma.user_profiles.findUnique({
            where: {user_id: userId}
        });

        if(!profile){
            return res.status(400).json({error: "User profile not found. Complete onboarding first"})
        }

        const latestPlan = await prisma.training_plans.findFirst({
            where: {user_id: userId},
            orderBy: { created_at: "desc"},
            select: {version: true}
        });

        const nextVersion = latestPlan ? latestPlan.version + 1 : 1;

        let planJson;

        try{
            planJson = await generateTrainingPlan(profile);

        } catch (error){
            console.error("Error generating plan:", error);
            return res.status(500).json({error:"Failed to generate plan"})
        }

        const planText = JSON.stringify(planJson, null, 2);

        const newPlan = await prisma.training_plans.create({
            data: {
                user_id: userId,
                plan_json: planJson as object,
                plan_text: planText,
                version: nextVersion,
            },
        });

        res.json({
            id: newPlan.id,
            version: newPlan.version,
            createdAt: newPlan.created_at,
        })

    }catch (error) {
        console.error("Error generating plan:", error);
        res.status(500).json({error:"Failed to generate plan"})
    }
});

planRouter.get("/current", async (req: AuthenticatedRequest, res) => {
    try{
        const userId = req.userId!;

        const currentPlan = await prisma.training_plans.findFirst({
            where: {user_id: userId},
            orderBy: { created_at: "desc"},
        });

        if(!currentPlan){
            return res.status(404).json({error: "Current plan not found"})
        }
        res.json({
            id: currentPlan.id,
            userId: currentPlan.user_id,
            planJson: currentPlan.plan_json,
            planText: currentPlan.plan_text,
            version: currentPlan.version,
            createdAt: currentPlan.created_at,
        })
    }catch (error) {
        console.error("Error fetching current plan:" ,error);
        res.status(500).json({error:"Failed to fetch current plan"})
    }
})