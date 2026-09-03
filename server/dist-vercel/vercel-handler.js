// src/app.ts
import dotenv2 from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// src/routes/profile.routes.ts
import { Router } from "express";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel training_plans {\n  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  user_id    String   @db.Uuid\n  plan_json  Json\n  plan_text  String\n  version    Int      @default(1)\n  created_at DateTime @default(now()) @db.Timestamptz(6)\n\n  @@index([user_id], map: "idx_training_plans_user_id")\n}\n\nmodel user_profiles {\n  user_id         String   @id @db.Uuid\n  goal            String   @db.VarChar(20)\n  experience      String   @db.VarChar(20)\n  days_per_week   Int\n  session_length  Int\n  equipment       String   @db.VarChar(20)\n  injuries        String?\n  preferred_split String   @db.VarChar(20)\n  updated_at      DateTime @default(now()) @db.Timestamptz(6)\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"training_plans":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"plan_json","kind":"scalar","type":"Json"},{"name":"plan_text","kind":"scalar","type":"String"},{"name":"version","kind":"scalar","type":"Int"},{"name":"created_at","kind":"scalar","type":"DateTime"}],"dbName":null},"user_profiles":{"fields":[{"name":"user_id","kind":"scalar","type":"String"},{"name":"goal","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"days_per_week","kind":"scalar","type":"Int"},{"name":"session_length","kind":"scalar","type":"Int"},{"name":"equipment","kind":"scalar","type":"String"},{"name":"injuries","kind":"scalar","type":"String"},{"name":"preferred_split","kind":"scalar","type":"String"},{"name":"updated_at","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","training_plans.findUnique","training_plans.findUniqueOrThrow","orderBy","cursor","training_plans.findFirst","training_plans.findFirstOrThrow","training_plans.findMany","data","training_plans.createOne","training_plans.createMany","training_plans.createManyAndReturn","training_plans.updateOne","training_plans.updateMany","training_plans.updateManyAndReturn","create","update","training_plans.upsertOne","training_plans.deleteOne","training_plans.deleteMany","having","_count","_avg","_sum","_min","_max","training_plans.groupBy","training_plans.aggregate","user_profiles.findUnique","user_profiles.findUniqueOrThrow","user_profiles.findFirst","user_profiles.findFirstOrThrow","user_profiles.findMany","user_profiles.createOne","user_profiles.createMany","user_profiles.createManyAndReturn","user_profiles.updateOne","user_profiles.updateMany","user_profiles.updateManyAndReturn","user_profiles.upsertOne","user_profiles.deleteOne","user_profiles.deleteMany","user_profiles.groupBy","user_profiles.aggregate","AND","OR","NOT","user_id","goal","experience","days_per_week","session_length","equipment","injuries","preferred_split","updated_at","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","id","plan_json","plan_text","version","created_at","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","set","increment","decrement","multiply","divide"]'),
  graph: "XhUgCSwAAE4AMC0AAAQAEC4AAE4AMC8BAEUAIUMBAAAAAUQAAE8AIEUBAEYAIUYCAEcAIUdAAEkAIQEAAAABACABAAAAAQAgCSwAAE4AMC0AAAQAEC4AAE4AMC8BAEUAIUMBAEUAIUQAAE8AIEUBAEYAIUYCAEcAIUdAAEkAIQADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAGLwEAAAABQwEAAAABRIAAAAABRQEAAAABRgIAAAABR0AAAAABAQgAAAkAIAYvAQAAAAFDAQAAAAFEgAAAAAFFAQAAAAFGAgAAAAFHQAAAAAEBCAAACwAwAQgAAAsAMAYvAQBWACFDAQBWACFEgAAAAAFFAQBWACFGAgBXACFHQABZACECAAAAAQAgCAAADgAgBi8BAFYAIUMBAFYAIUSAAAAAAUUBAFYAIUYCAFcAIUdAAFkAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBRUAAFoAIBYAAFsAIBcAAF4AIBgAAF0AIBkAAFwAIAksAABLADAtAAAXABAuAABLADAvAQA0ACFDAQA0ACFEAABMACBFAQA1ACFGAgA2ACFHQAA4ACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIAwsAABEADAtAAAdABAuAABEADAvAQAAAAEwAQBGACExAQBGACEyAgBHACEzAgBHACE0AQBGACE1AQBIACE2AQBGACE3QABJACEBAAAAGgAgAQAAABoAIAwsAABEADAtAAAdABAuAABEADAvAQBFACEwAQBGACExAQBGACEyAgBHACEzAgBHACE0AQBGACE1AQBIACE2AQBGACE3QABJACEBNQAAUAAgAwAAAB0AIAMAAB4AMAQAABoAIAMAAAAdACADAAAeADAEAAAaACADAAAAHQAgAwAAHgAwBAAAGgAgCS8BAAAAATABAAAAATEBAAAAATICAAAAATMCAAAAATQBAAAAATUBAAAAATYBAAAAATdAAAAAAQEIAAAiACAJLwEAAAABMAEAAAABMQEAAAABMgIAAAABMwIAAAABNAEAAAABNQEAAAABNgEAAAABN0AAAAABAQgAACQAMAEIAAAkADAJLwEAVgAhMAEAVgAhMQEAVgAhMgIAVwAhMwIAVwAhNAEAVgAhNQEAWAAhNgEAVgAhN0AAWQAhAgAAABoAIAgAACcAIAkvAQBWACEwAQBWACExAQBWACEyAgBXACEzAgBXACE0AQBWACE1AQBYACE2AQBWACE3QABZACECAAAAHQAgCAAAKQAgAgAAAB0AIAgAACkAIAMAAAAaACAPAAAiACAQAAAnACABAAAAGgAgAQAAAB0AIAYVAABRACAWAABSACAXAABVACAYAABUACAZAABTACA1AABQACAMLAAAMwAwLQAAMAAQLgAAMwAwLwEANAAhMAEANQAhMQEANQAhMgIANgAhMwIANgAhNAEANQAhNQEANwAhNgEANQAhN0AAOAAhAwAAAB0AIAMAAC8AMBQAADAAIAMAAAAdACADAAAeADAEAAAaACAMLAAAMwAwLQAAMAAQLgAAMwAwLwEANAAhMAEANQAhMQEANQAhMgIANgAhMwIANgAhNAEANQAhNQEANwAhNgEANQAhN0AAOAAhCxUAADoAIBgAAEIAIBkAAEIAIDgBAAAAATkBAAAABDoBAAAABDsBAAAAATwBAAAAAT0BAAAAAT4BAAAAAT8BAEMAIQ4VAAA6ACAYAABCACAZAABCACA4AQAAAAE5AQAAAAQ6AQAAAAQ7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBBACFAAQAAAAFBAQAAAAFCAQAAAAENFQAAOgAgFgAAQAAgFwAAOgAgGAAAOgAgGQAAOgAgOAIAAAABOQIAAAAEOgIAAAAEOwIAAAABPAIAAAABPQIAAAABPgIAAAABPwIAPwAhDhUAAD0AIBgAAD4AIBkAAD4AIDgBAAAAATkBAAAABToBAAAABTsBAAAAATwBAAAAAT0BAAAAAT4BAAAAAT8BADwAIUABAAAAAUEBAAAAAUIBAAAAAQsVAAA6ACAYAAA7ACAZAAA7ACA4QAAAAAE5QAAAAAQ6QAAAAAQ7QAAAAAE8QAAAAAE9QAAAAAE-QAAAAAE_QAA5ACELFQAAOgAgGAAAOwAgGQAAOwAgOEAAAAABOUAAAAAEOkAAAAAEO0AAAAABPEAAAAABPUAAAAABPkAAAAABP0AAOQAhCDgCAAAAATkCAAAABDoCAAAABDsCAAAAATwCAAAAAT0CAAAAAT4CAAAAAT8CADoAIQg4QAAAAAE5QAAAAAQ6QAAAAAQ7QAAAAAE8QAAAAAE9QAAAAAE-QAAAAAE_QAA7ACEOFQAAPQAgGAAAPgAgGQAAPgAgOAEAAAABOQEAAAAFOgEAAAAFOwEAAAABPAEAAAABPQEAAAABPgEAAAABPwEAPAAhQAEAAAABQQEAAAABQgEAAAABCDgCAAAAATkCAAAABToCAAAABTsCAAAAATwCAAAAAT0CAAAAAT4CAAAAAT8CAD0AIQs4AQAAAAE5AQAAAAU6AQAAAAU7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQA-ACFAAQAAAAFBAQAAAAFCAQAAAAENFQAAOgAgFgAAQAAgFwAAOgAgGAAAOgAgGQAAOgAgOAIAAAABOQIAAAAEOgIAAAAEOwIAAAABPAIAAAABPQIAAAABPgIAAAABPwIAPwAhCDgIAAAAATkIAAAABDoIAAAABDsIAAAAATwIAAAAAT0IAAAAAT4IAAAAAT8IAEAAIQ4VAAA6ACAYAABCACAZAABCACA4AQAAAAE5AQAAAAQ6AQAAAAQ7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBBACFAAQAAAAFBAQAAAAFCAQAAAAELOAEAAAABOQEAAAAEOgEAAAAEOwEAAAABPAEAAAABPQEAAAABPgEAAAABPwEAQgAhQAEAAAABQQEAAAABQgEAAAABCxUAADoAIBgAAEIAIBkAAEIAIDgBAAAAATkBAAAABDoBAAAABDsBAAAAATwBAAAAAT0BAAAAAT4BAAAAAT8BAEMAIQwsAABEADAtAAAdABAuAABEADAvAQBFACEwAQBGACExAQBGACEyAgBHACEzAgBHACE0AQBGACE1AQBIACE2AQBGACE3QABJACEIOAEAAAABOQEAAAAEOgEAAAAEOwEAAAABPAEAAAABPQEAAAABPgEAAAABPwEASgAhCzgBAAAAATkBAAAABDoBAAAABDsBAAAAATwBAAAAAT0BAAAAAT4BAAAAAT8BAEIAIUABAAAAAUEBAAAAAUIBAAAAAQg4AgAAAAE5AgAAAAQ6AgAAAAQ7AgAAAAE8AgAAAAE9AgAAAAE-AgAAAAE_AgA6ACELOAEAAAABOQEAAAAFOgEAAAAFOwEAAAABPAEAAAABPQEAAAABPgEAAAABPwEAPgAhQAEAAAABQQEAAAABQgEAAAABCDhAAAAAATlAAAAABDpAAAAABDtAAAAAATxAAAAAAT1AAAAAAT5AAAAAAT9AADsAIQg4AQAAAAE5AQAAAAQ6AQAAAAQ7AQAAAAE8AQAAAAE9AQAAAAE-AQAAAAE_AQBKACEJLAAASwAwLQAAFwAQLgAASwAwLwEANAAhQwEANAAhRAAATAAgRQEANQAhRgIANgAhR0AAOAAhDxUAADoAIBgAAE0AIBkAAE0AIDiAAAAAATuAAAAAATyAAAAAAT2AAAAAAT6AAAAAAT-AAAAAAUgBAAAAAUkBAAAAAUoBAAAAAUuAAAAAAUyAAAAAAU2AAAAAAQw4gAAAAAE7gAAAAAE8gAAAAAE9gAAAAAE-gAAAAAE_gAAAAAFIAQAAAAFJAQAAAAFKAQAAAAFLgAAAAAFMgAAAAAFNgAAAAAEJLAAATgAwLQAABAAQLgAATgAwLwEARQAhQwEARQAhRAAATwAgRQEARgAhRgIARwAhR0AASQAhDDiAAAAAATuAAAAAATyAAAAAAT2AAAAAAT6AAAAAAT-AAAAAAUgBAAAAAUkBAAAAAUoBAAAAAUuAAAAAAUyAAAAAAU2AAAAAAQAAAAAAAAFOAQAAAAEFTgIAAAABTwIAAAABUAIAAAABUQIAAAABUgIAAAABAU4BAAAAAQFOQAAAAAEAAAAAAAAAAAAFFQAGFgAHFwAIGAAJGQAKAAAAAAAFFQAGFgAHFwAIGAAJGQAKAAAABRUAEBYAERcAEhgAExkAFAAAAAAABRUAEBYAERcAEhgAExkAFAECAQIDAQUGAQYHAQcIAQkKAQoMAgsNAwwPAQ0RAg4SBBETARIUARMVAhoYBRsZCxwbDB0cDB4fDB8gDCAhDCEjDCIlAiMmDSQoDCUqAiYrDicsDCgtDCkuAioxDysyFQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
var connectionString = process.env.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/middleware/validate.ts
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
      return res.status(400).json({ error: `Invalid request: ${message}` });
    }
    req.body = result.data;
    next();
  };
}

// src/validation/schemas.ts
import { z } from "zod";
var profileSchema = z.object({
  goal: z.enum(["cut", "bulk", "recomp", "strength", "endurance"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(2).max(6),
  sessionLength: z.number().int().min(20).max(180),
  equipment: z.enum(["full_gym", "home", "dumbbells"]),
  injuries: z.string().max(500).optional().or(z.literal("")).transform((v) => v || void 0),
  preferredSplit: z.enum(["full_body", "upper_lower", "ppl", "custom"])
});
var generatePlanSchema = z.object({});

// src/routes/profile.routes.ts
var profileRouter = Router();
profileRouter.post(
  "/",
  validate(profileSchema),
  async (req, res) => {
    try {
      const userId = req.userId;
      const {
        goal,
        experience,
        daysPerWeek,
        sessionLength,
        equipment,
        injuries,
        preferredSplit
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
          updated_at: /* @__PURE__ */ new Date()
        },
        create: {
          user_id: userId,
          goal,
          experience,
          days_per_week: daysPerWeek,
          session_length: sessionLength,
          equipment,
          injuries: injuries || null,
          preferred_split: preferredSplit
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ error: "Failed to save profile" });
    }
  }
);

// src/routes/plan.routes.ts
import { Router as Router2 } from "express";

// src/lib/ai.ts
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
var FREE_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "deepseek/deepseek-v4-flash:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free"
];
function extractJSON(raw2) {
  const fenced = raw2.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fenced ? fenced[1].trim() : raw2.trim();
  const start = text.indexOf("{");
  if (start === -1) throw new SyntaxError("No JSON object found in response");
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new SyntaxError("Truncated JSON \u2014 no closing brace found");
}
function toNumber(value, fallback) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
function formatPlanResponse(aiResponse, profile) {
  const raw2 = aiResponse && typeof aiResponse === "object" ? aiResponse : {};
  const plan = {
    overview: {
      goal: typeof raw2.overview?.goal === "string" ? raw2.overview.goal : `Customized ${profile.goal} program`,
      frequency: typeof raw2.overview?.frequency === "string" ? raw2.overview.frequency : `${profile.days_per_week} days per week`,
      split: typeof raw2.overview?.split === "string" ? raw2.overview.split : profile.preferred_split,
      notes: typeof raw2.overview?.notes === "string" ? raw2.overview.notes : "This program is designed to help you achieve your fitness goals based on your profile."
    },
    weeklySchedule: Array.isArray(raw2.weeklySchedule) ? raw2.weeklySchedule.map((day) => ({
      day: typeof day.day === "string" ? day.day : "Day",
      focus: typeof day.focus === "string" ? day.focus : "General",
      exercises: Array.isArray(day.exercises) ? day.exercises.map((ex) => ({
        name: typeof ex.name === "string" ? ex.name : "Exercise",
        sets: toNumber(ex.sets, 3),
        reps: typeof ex.reps === "string" ? ex.reps : "8-12",
        rest: typeof ex.rest === "string" ? ex.rest : "60-90 sec",
        rpe: toNumber(ex.rpe, 7),
        notes: typeof ex.notes === "string" && ex.notes.length > 0 ? ex.notes : void 0,
        alternatives: Array.isArray(ex.alternatives) ? ex.alternatives.map((a) => String(a)) : []
      })) : []
    })) : [],
    progression: typeof raw2.progression === "string" ? raw2.progression : "Progression strategy will be implemented based on your performance and goals."
  };
  return plan;
}
async function generateTrainingPlan(profile) {
  const normalizedProfile = {
    goal: typeof profile.goal === "string" ? profile.goal : "bulk",
    experience: typeof profile.experience === "string" ? profile.experience : "intermediate",
    days_per_week: typeof profile.days_per_week === "number" ? profile.days_per_week : 4,
    session_length: typeof profile.session_length === "number" ? profile.session_length : 60,
    equipment: typeof profile.equipment === "string" ? profile.equipment : "full_gym",
    injuries: profile.injuries && typeof profile.injuries === "string" ? profile.injuries : null,
    preferred_split: typeof profile.preferred_split === "string" ? profile.preferred_split : "upper_lower"
  };
  const apiKey = process.env.OPENROUTER_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_KEY is not set in env");
  }
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.BASE_URL || "http://localhost:3000",
      "X-Title": "RandomRep Plan Generator"
    }
  });
  const prompt = buildPrompt(normalizedProfile);
  let lastError = null;
  for (const model of FREE_MODELS) {
    try {
      console.log(`[AI] Trying model: ${model}`);
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are a fitness coach API. 
                      Respond with ONLY valid JSON. No explanation, no markdown, no text before or after.
                      The response must be a single JSON object.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      });
      const content = completion.choices[0].message.content;
      if (!content) {
        console.warn(`[AI] Model ${model} returned no content, trying next...`);
        continue;
      }
      const planData = extractJSON(content);
      console.log(`[AI] Success with model: ${model}`);
      return formatPlanResponse(planData, normalizedProfile);
    } catch (error) {
      const status = error && typeof error === "object" && "status" in error ? error.status : void 0;
      if (status === 429 || status === 404 || status === 400 || error instanceof SyntaxError) {
        console.warn(
          `[AI] Model ${model} failed (${error instanceof SyntaxError ? "bad JSON" : String(status)}), trying next...`
        );
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
      console.error("[AI] Error generating plan:", error);
      throw error;
    }
  }
  console.error("[AI] All models failed");
  throw lastError ?? new Error("All models failed to generate a plan");
}
function buildPrompt(profile) {
  const goalMap = {
    bulk: "build muscle and gain size",
    cut: "lose fat and maintain muscle",
    recomp: "simultaneously lose fat and build muscle",
    strength: "build maximum strength",
    endurance: "improve cardiovascular endurance and stamina"
  };
  const experienceMap = {
    beginner: "beginner (0-1 years of training experience)",
    intermediate: "intermediate (1-3 years of training experience)",
    advanced: "advanced (3+ years of training experience)"
  };
  const equipmentMap = {
    full_gym: "full gym access with all equipment",
    home: "home gym with limited equipment",
    dumbbells: "only dumbbells available"
  };
  const splitMap = {
    full_body: "full body workouts",
    upper_lower: "upper/lower split",
    ppl: "push/pull/legs split",
    custom: "best split for their goals"
  };
  return `Create a personalized ${profile.days_per_week}-day per week training plan for someone with the following profile:
  
    Goal: ${goalMap[profile.goal] || profile.goal}
    Experience Level: ${experienceMap[profile.experience] || profile.experience}
    Session Length: ${profile.session_length} minutes per session
    Equipment: ${equipmentMap[profile.equipment] || profile.equipment}
    Preferred Split: ${splitMap[profile.preferred_split] || profile.preferred_split}
    ${profile.injuries ? `Injuries/Limitations: ${profile.injuries}` : ""}

    Generate a complete training plan in JSON format with this exact structure:
    {
    "overview": {
        "goal": "brief description of the training goal",
        "frequency": "X days per week",
        "split": "training split name",
        "notes": "important notes about the program (2-3 sentences)"
    },
    "weeklySchedule": [
        {
        "day": "Monday",
        "focus": "muscle group or focus area",
        "exercises": [
            {
            "name": "Exercise Name",
            "sets": 4,
            "reps": "6-8",
            "rest": "2-3 min",
            "rpe": 8,
            "notes": "form cues or tips (optional)",
            "alternatives": ["Alternative 1", "Alternative 2"]
            }
        ]
        }
    ],
    "progression": "detailed progression strategy (2-3 sentences explaining how to progress)"
    }

    Requirements:
    - Create exactly ${profile.days_per_week} workout days
    - Each workout should fit within ${profile.session_length} minutes
    - Include 4-6 exercises per workout
    - RPE (Rate of Perceived Exertion) should be 6-9
    - Include compound movements for beginners/intermediate, advanced can have more isolation
    - Match the preferred split type: ${profile.preferred_split}
    - ${profile.injuries ? `Avoid exercises that could aggravate: ${profile.injuries}` : ""}
    - Provide exercise alternatives where appropriate
    - Make it progressive and suitable for ${experienceMap[profile.experience] || profile.experience} level
    
    Return ONLY the JSON object (no markdown, no extra text).
    `;
}

// src/middleware/rateLimit.ts
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
var planGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = req;
    return auth.userId ?? ipKeyGenerator(req.ip ?? "");
  },
  message: {
    error: "Too many plan generations. Please try again later."
  }
});

// src/routes/plan.routes.ts
var planRouter = Router2();
planRouter.post(
  "/generate",
  planGenerationLimiter,
  validate(generatePlanSchema),
  async (req, res) => {
    try {
      const userId = req.userId;
      const profile = await prisma.user_profiles.findUnique({
        where: { user_id: userId }
      });
      if (!profile) {
        return res.status(400).json({ error: "User profile not found. Complete onboarding first" });
      }
      const latestPlan = await prisma.training_plans.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        select: { version: true }
      });
      const nextVersion = latestPlan ? latestPlan.version + 1 : 1;
      let planJson;
      try {
        planJson = await generateTrainingPlan(profile);
      } catch (error) {
        console.error("Error generating plan:", error);
        return res.status(500).json({ error: "Failed to generate plan" });
      }
      const planText = JSON.stringify(planJson, null, 2);
      const newPlan = await prisma.training_plans.create({
        data: {
          user_id: userId,
          plan_json: planJson,
          plan_text: planText,
          version: nextVersion
        }
      });
      res.json({
        id: newPlan.id,
        version: newPlan.version,
        createdAt: newPlan.created_at
      });
    } catch (error) {
      console.error("Error generating plan:", error);
      res.status(500).json({ error: "Failed to generate plan" });
    }
  }
);
planRouter.get("/current", async (req, res) => {
  try {
    const userId = req.userId;
    const currentPlan = await prisma.training_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" }
    });
    if (!currentPlan) {
      return res.status(404).json({ error: "Current plan not found" });
    }
    res.json({
      id: currentPlan.id,
      userId: currentPlan.user_id,
      planJson: currentPlan.plan_json,
      planText: currentPlan.plan_text,
      version: currentPlan.version,
      createdAt: currentPlan.created_at
    });
  } catch (error) {
    console.error("Error fetching current plan:", error);
    res.status(500).json({ error: "Failed to fetch current plan" });
  }
});

// src/middleware/auth.ts
import { createRemoteJWKSet, jwtVerify } from "jose";
var jwksCache;
function getJwks(authUrl) {
  if (jwksCache && jwksCache.key === authUrl) return jwksCache.jwks;
  const jwks = createRemoteJWKSet(
    new URL(`${authUrl}/.well-known/jwks.json`)
  );
  jwksCache = { jwks, key: authUrl };
  return jwks;
}
function authOrigin(authUrl) {
  const url = new URL(authUrl);
  return `${url.protocol}//${url.host}`;
}
async function requireAuth(req, res, next) {
  const authUrl = process.env.NEON_AUTH_URL;
  if (!authUrl) {
    console.error("[Auth] NEON_AUTH_URL is not configured");
    return res.status(500).json({ error: "Auth not configured" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.slice(7);
  const issuer = authOrigin(authUrl);
  try {
    const { payload } = await jwtVerify(token, getJwks(authUrl), {
      issuer,
      audience: issuer
    });
    if (!payload.sub) {
      return res.status(401).json({ error: "Invalid session data" });
    }
    req.userId = payload.sub;
    next();
  } catch (error) {
    console.error("[Auth] Session verification failed:", error);
    return res.status(401).json({ error: "Failed to verify session" });
  }
}

// src/app.ts
dotenv2.config();
function createApp() {
  const app = express();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",").map((o) => o.trim());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api", requireAuth);
  app.use("/api/profile", profileRouter);
  app.use("/api/plan", planRouter);
  return app;
}

// src/vercel-handler.ts
var vercel_handler_default = createApp();
export {
  vercel_handler_default as default
};
//# sourceMappingURL=vercel-handler.js.map