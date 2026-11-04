import { describe, expect, it } from "vitest";
import type { BarkleyReward } from "@focusflow/validators";
import { rewardGoal } from "../reward-goal";

const r = (id: string, starsRequired: number) => ({ id, name: id, starsRequired }) as BarkleyReward;

describe("rewardGoal", () => {
  it("points at the cheapest reward still out of reach", () => {
    expect(rewardGoal([r("film", 20), r("dessert", 12), r("parc", 5)], 9)).toEqual({
      kind: "next",
      reward: r("dessert", 12),
      missing: 3,
      progress: 0.75,
    });
  });

  it("says a reward is ready when every reward is affordable", () => {
    expect(rewardGoal([r("parc", 5), r("dessert", 8)], 9)).toEqual({ kind: "ready", reward: r("dessert", 8) });
  });

  it("ignores free rewards and handles an empty board", () => {
    expect(rewardGoal([r("calin", 0)], 3)).toBeNull();
    expect(rewardGoal([], 3)).toBeNull();
  });
});
