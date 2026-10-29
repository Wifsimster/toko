import type { MoSize, MoState } from "@focusflow/mo";
import type { OnboardingGoal } from "@/stores/ui-store";
import { PARENT_MOOD_FACES, type MoodScore } from "@/components/mo/parent-mood-faces";

export type MoodId = "calme" | "trop-plein" | "fatigue" | "fierte" | "inquietude" | "silence";

const face = (score: MoodScore) => ({ score, ...PARENT_MOOD_FACES[score] });

export const MOODS: ReadonlyArray<{
  id: MoodId;
  state: MoState;
  surface: string;
  score: MoodScore | null;
}> = [
  { id: "calme", ...face(4) },
  { id: "trop-plein", ...face(2) },
  { id: "fatigue", ...face(1) },
  { id: "fierte", ...face(5) },
  { id: "inquietude", ...face(3) },
  { id: "silence", state: "accueil", surface: "bg-surface-rose", score: null },
];

export const GOALS: ReadonlyArray<{
  id: OnboardingGoal;
  icon: "matins" | "rendezVous" | "crises" | "encourager" | "couchers";
  surface: string;
}> = [
  { id: "mornings", icon: "matins", surface: "bg-surface-honey" },
  { id: "appointment", icon: "rendezVous", surface: "bg-surface-mint" },
  { id: "crises", icon: "crises", surface: "bg-surface-peach" },
  { id: "encouragement", icon: "encourager", surface: "bg-surface-lavender" },
  { id: "bedtime", icon: "couchers", surface: "bg-surface-sky" },
];

export const ONBOARDING_ART: ReadonlyArray<readonly [MoState, MoSize]> = [
  ["accueil", "large"],
  ["calme", "large"],
  ["trop-plein", "large"],
  ["fatigue", "large"],
  ["fierte", "large"],
  ["inquietude", "large"],
  ["concentration", "large"],
  ["marche", "large"],
  ["calme", "small"],
  ["trop-plein", "small"],
  ["fatigue", "small"],
  ["fierte", "small"],
];
