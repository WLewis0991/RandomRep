import dotenv from "dotenv";
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import { profileRouter } from "./routes/profile.routes";
import { planRouter } from "./routes/plan.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//Routes
app.use("/api/profile", profileRouter)
app.use("/api/plan", planRouter)

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`)
}
)
