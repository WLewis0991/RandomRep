import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractJSON, formatPlanResponse, generateTrainingPlan } from "./ai";
import type { UserProfile } from "../types/serverTypes";

const profile: UserProfile = {
  goal: "bulk",
  experience: "intermediate",
  days_per_week: 4,
  session_length: 60,
  equipment: "full_gym",
  preferred_split: "upper_lower",
};

describe("extractJSON", () => {
  it("parses bare JSON", () => {
    const result = extractJSON('{"a":1}');
    expect(result).toEqual({ a: 1 });
  });

  it("parses markdown-fenced JSON", () => {
    const result = extractJSON('```json\n{"a":1}\n```');
    expect(result).toEqual({ a: 1 });
  });

  it("parses fenced JSON without the language tag", () => {
    const result = extractJSON('```\n{"a":1}\n```');
    expect(result).toEqual({ a: 1 });
  });

  it("parses JSON with trailing text after the object", () => {
    const result = extractJSON('{"a":1} and some trailing explanation');
    expect(result).toEqual({ a: 1 });
  });

  it("parses JSON with leading text before the object", () => {
    const result = extractJSON('Here is your plan: {"a":1}');
    expect(result).toEqual({ a: 1 });
  });

  it("does not count braces inside string values", () => {
    const raw = '{"text":"{not a real brace}","nested":{"x":1}}';
    const result = extractJSON(raw);
    expect(result).toEqual({ text: "{not a real brace}", nested: { x: 1 } });
  });

  it("handles escaped quotes inside strings", () => {
    const raw = '{"quote":"he said \\"hi\\"","b":2}';
    const result = extractJSON(raw);
    expect(result).toEqual({ quote: 'he said "hi"', b: 2 });
  });

  it("throws when there is no JSON object", () => {
    expect(() => extractJSON("just some text")).toThrow(SyntaxError);
  });

  it("throws when JSON is truncated", () => {
    expect(() => extractJSON('{"a":1')).toThrow(SyntaxError);
  });
});

describe("formatPlanResponse", () => {
  it("preserves a complete response", () => {
    const input = {
      overview: {
        goal: "Build muscle",
        frequency: "4 days per week",
        split: "Upper/Lower",
        notes: "Some notes",
      },
      weeklySchedule: [
        {
          day: "Monday",
          focus: "Push",
          exercises: [
            {
              name: "Bench Press",
              sets: 4,
              reps: "6-8",
              rest: "2-3 min",
              rpe: 8,
              notes: "Keep elbows tucked",
              alternatives: ["Incline Press", "Dips"],
            },
          ],
        },
      ],
      progression: "Add weight weekly.",
    };

    const result = formatPlanResponse(input, profile);
    expect(result.overview.goal).toBe("Build muscle");
    expect(result.weeklySchedule).toHaveLength(1);
    expect(result.weeklySchedule[0].day).toBe("Monday");
    expect(result.weeklySchedule[0].exercises[0]).toEqual({
      name: "Bench Press",
      sets: 4,
      reps: "6-8",
      rest: "2-3 min",
      rpe: 8,
      notes: "Keep elbows tucked",
      alternatives: ["Incline Press", "Dips"],
    });
    expect(result.progression).toBe("Add weight weekly.");
  });

  it("fills in defaults for missing overview fields", () => {
    const result = formatPlanResponse({ weeklySchedule: [] }, profile);
    expect(result.overview.goal).toBe("Customized bulk program");
    expect(result.overview.frequency).toBe("4 days per week");
    expect(result.overview.split).toBe("upper_lower");
    expect(result.overview.notes).toBeTruthy();
  });

  it("returns an empty weekly schedule when missing", () => {
    const result = formatPlanResponse({}, profile);
    expect(result.weeklySchedule).toEqual([]);
  });

  it("fills defaults for a missing exercise", () => {
    const input = {
      weeklySchedule: [{ day: "Monday", exercises: [{}] }],
    };
    const result = formatPlanResponse(input, profile);
    const exercise = result.weeklySchedule[0].exercises[0];
    expect(exercise.name).toBe("Exercise");
    expect(exercise.sets).toBe(3);
    expect(exercise.reps).toBe("8-12");
    expect(exercise.rest).toBe("60-90 sec");
    expect(exercise.rpe).toBe(7);
  });

  it("returns an empty exercises list for a day with no exercises", () => {
    const input = {
      weeklySchedule: [{ day: "Monday" }],
    };
    const result = formatPlanResponse(input, profile);
    expect(result.weeklySchedule[0].exercises).toEqual([]);
  });

  it("coerces string numeric sets and rpe to numbers", () => {
    const input = {
      weeklySchedule: [
        {
          exercises: [{ name: "Squat", sets: "5", reps: "5", rpe: "8" }],
        },
      ],
    };
    const result = formatPlanResponse(input, profile);
    expect(result.weeklySchedule[0].exercises[0].sets).toBe(5);
    expect(result.weeklySchedule[0].exercises[0].rpe).toBe(8);
  });

  it("handles non-object aiResponse gracefully", () => {
    const result = formatPlanResponse("not an object", profile);
    expect(result.weeklySchedule).toEqual([]);
    expect(result.overview.goal).toBe("Customized bulk program");
  });
});

describe("generateTrainingPlan (validation guards)", () => {
  beforeEach(() => {
    vi.stubEnv("OPENROUTER_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when OPENROUTER_KEY is not set", async () => {
    await expect(generateTrainingPlan(profile)).rejects.toThrow(
      "OPENROUTER_KEY is not set",
    );
  });
});
