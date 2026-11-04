import type { BarkleyReward } from "@focusflow/validators";

export type RewardGoal =
  | { kind: "ready"; reward: BarkleyReward }
  | { kind: "next"; reward: BarkleyReward; missing: number; progress: number }
  | null;

export function rewardGoal(rewards: readonly BarkleyReward[], available: number): RewardGoal {
  const byCost = rewards.filter((r) => r.starsRequired > 0).toSorted((a, b) => a.starsRequired - b.starsRequired);
  const next = byCost.find((r) => r.starsRequired > available);
  const ready = byCost.filter((r) => r.starsRequired <= available).at(-1);
  if (next) {
    return {
      kind: "next",
      reward: next,
      missing: next.starsRequired - available,
      progress: Math.min(1, Math.max(0, available / next.starsRequired)),
    };
  }
  return ready ? { kind: "ready", reward: ready } : null;
}
