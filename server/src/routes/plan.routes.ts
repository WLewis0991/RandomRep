import { Router, type Request, type Response} from "express";

export const planRouter = Router();

planRouter.post("/generate", async (req:Request, res: Response) => {
    try{
        const{ userId }=req.body;

        if(!userId) {
            return res.status(400).json({error:"User ID required"})
        }
    }catch (error) {
        console.error("Error generating plan:", error);
        res.status(500).json({error:"Failed to generate plan"})
    }
})