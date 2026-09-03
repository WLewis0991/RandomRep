import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { UserProfile } from "../types/serverTypes";

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };
    }),
  };
});

import { generateTrainingPlan } from "./ai";

const profile: UserProfile = {
  goal: "bulk",
  experience: "intermediate",
  days_per_week: 4,
  session_length: 60,
  equipment: "full_gym",
  preferred_split: "upper_lower",
};

beforeEach(() => {
  vi.stubEnv("OPENROUTER_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("generateTrainingPlan fallback", () => {
  it("returns a plan when the first model succeeds", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content:
              '{"overview":{"goal":"Build"},"weeklySchedule":[],"progression":"x"}',
          },
        },
      ],
    });

    const plan = await generateTrainingPlan(profile);
    expect(plan.overview.goal).toBe("Build");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("falls back to the next model on a 429 error", async () => {
    const status429 = Object.assign(new Error("rate limited"), { status: 429 });
    mockCreate
      .mockRejectedValueOnce(status429)
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                '{"overview":{"goal":"From Second"},"weeklySchedule":[],"progression":"x"}',
            },
          },
        ],
      });

    const plan = await generateTrainingPlan(profile);
    expect(plan.overview.goal).toBe("From Second");
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("falls back on bad JSON from the first model", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: "not json" } }],
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                '{"overview":{"goal":"After Bad JSON"},"weeklySchedule":[],"progression":"x"}',
            },
          },
        ],
      });

    const plan = await generateTrainingPlan(profile);
    expect(plan.overview.goal).toBe("After Bad JSON");
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("throws after all models fail", async () => {
    const status429 = Object.assign(new Error("rate limited"), { status: 429 });
    mockCreate.mockRejectedValue(status429);

    await expect(generateTrainingPlan(profile)).rejects.toThrow(
      "rate limited",
    );
  });
});
