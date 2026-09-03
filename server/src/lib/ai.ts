import OpenAI from "openai";
import dotenv from "dotenv";
import type { TrainingPlan, UserProfile } from "../types/serverTypes";

dotenv.config();

const FREE_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "deepseek/deepseek-v4-flash:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
];

export function extractJSON(raw: string): unknown {
  // Strip markdown fences
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fenced ? fenced[1].trim() : raw.trim();

  // Find the outermost { } block
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

  throw new SyntaxError("Truncated JSON — no closing brace found");
}

interface RawExercise {
  name?: unknown;
  sets?: unknown;
  reps?: unknown;
  rest?: unknown;
  rpe?: unknown;
  notes?: unknown;
  alternatives?: unknown;
}

interface RawDay {
  day?: unknown;
  focus?: unknown;
  exercises?: RawExercise[];
}

interface RawPlan {
  overview?: {
    goal?: unknown;
    frequency?: unknown;
    split?: unknown;
    notes?: unknown;
  };
  weeklySchedule?: RawDay[];
  progression?: unknown;
}

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function formatPlanResponse(
  aiResponse: unknown,
  profile: UserProfile,
): Omit<TrainingPlan, "id" | "userId" | "createdAt" | "version"> {
  const raw: RawPlan =
    aiResponse && typeof aiResponse === "object" ? (aiResponse as RawPlan) : {};

  const plan: Omit<TrainingPlan, "id" | "userId" | "createdAt" | "version"> = {
    overview: {
      goal:
        typeof raw.overview?.goal === "string"
          ? raw.overview.goal
          : `Customized ${profile.goal} program`,
      frequency:
        typeof raw.overview?.frequency === "string"
          ? raw.overview.frequency
          : `${profile.days_per_week} days per week`,
      split:
        typeof raw.overview?.split === "string"
          ? raw.overview.split
          : profile.preferred_split,
      notes:
        typeof raw.overview?.notes === "string"
          ? raw.overview.notes
          : "This program is designed to help you achieve your fitness goals based on your profile.",
    },
    weeklySchedule: Array.isArray(raw.weeklySchedule)
      ? raw.weeklySchedule.map((day: RawDay) => ({
          day: typeof day.day === "string" ? day.day : "Day",
          focus: typeof day.focus === "string" ? day.focus : "General",
          exercises: Array.isArray(day.exercises)
            ? day.exercises.map((ex: RawExercise) => ({
                name: typeof ex.name === "string" ? ex.name : "Exercise",
                sets: toNumber(ex.sets, 3),
                reps: typeof ex.reps === "string" ? ex.reps : "8-12",
                rest: typeof ex.rest === "string" ? ex.rest : "60-90 sec",
                rpe: toNumber(ex.rpe, 7),
                notes:
                  typeof ex.notes === "string" && ex.notes.length > 0
                    ? ex.notes
                    : undefined,
                alternatives: Array.isArray(ex.alternatives)
                  ? ex.alternatives.map((a) => String(a))
                  : [],
              }))
            : [],
        }))
      : [],
    progression:
      typeof raw.progression === "string"
        ? raw.progression
        : "Progression strategy will be implemented based on your performance and goals.",
  };
  return plan;
}

export async function generateTrainingPlan(
  profile: UserProfile | Record<string, unknown>,
): Promise<Omit<TrainingPlan, "id" | "userId" | "createdAt" | "version">> {
  const normalizedProfile: UserProfile = {
    goal: typeof profile.goal === "string" ? profile.goal : "bulk",
    experience:
      typeof profile.experience === "string" ? profile.experience : "intermediate",
    days_per_week:
      typeof profile.days_per_week === "number" ? profile.days_per_week : 4,
    session_length:
      typeof profile.session_length === "number" ? profile.session_length : 60,
    equipment: typeof profile.equipment === "string" ? profile.equipment : "full_gym",
    injuries:
      profile.injuries && typeof profile.injuries === "string"
        ? profile.injuries
        : null,
    preferred_split:
      typeof profile.preferred_split === "string"
        ? profile.preferred_split
        : "upper_lower",
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
      "X-Title": "RandomRep Plan Generator",
    },
  });

  const prompt = buildPrompt(normalizedProfile);
  let lastError: Error | null = null;

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
                      The response must be a single JSON object.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
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
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as { status?: unknown }).status
          : undefined;

      if (status === 429 || status === 404 || status === 400 || error instanceof SyntaxError) {
        console.warn(
          `[AI] Model ${model} failed (${error instanceof SyntaxError ? "bad JSON" : String(status)}), trying next...`,
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

function buildPrompt(profile: UserProfile): string {
  const goalMap: Record<string, string> = {
    bulk: "build muscle and gain size",
    cut: "lose fat and maintain muscle",
    recomp: "simultaneously lose fat and build muscle",
    strength: "build maximum strength",
    endurance: "improve cardiovascular endurance and stamina",
  };

  const experienceMap: Record<string, string> = {
    beginner: "beginner (0-1 years of training experience)",
    intermediate: "intermediate (1-3 years of training experience)",
    advanced: "advanced (3+ years of training experience)",
  };

  const equipmentMap: Record<string, string> = {
    full_gym: "full gym access with all equipment",
    home: "home gym with limited equipment",
    dumbbells: "only dumbbells available",
  };

  const splitMap: Record<string, string> = {
    full_body: "full body workouts",
    upper_lower: "upper/lower split",
    ppl: "push/pull/legs split",
    custom: "best split for their goals",
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

