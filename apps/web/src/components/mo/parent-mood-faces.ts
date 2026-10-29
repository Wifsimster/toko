import type { MoState } from "@focusflow/mo";

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export const PARENT_MOOD_FACES: Readonly<Record<MoodScore, { state: MoState; surface: string }>> = {
  1: { state: "fatigue", surface: "bg-surface-lavender" },
  2: { state: "trop-plein", surface: "bg-surface-peach" },
  3: { state: "inquietude", surface: "bg-surface-sky" },
  4: { state: "calme", surface: "bg-surface-mint" },
  5: { state: "fierte", surface: "bg-surface-honey" },
};

export const PARENT_MOOD_SCORES = [1, 2, 3, 4, 5] as const satisfies readonly MoodScore[];
