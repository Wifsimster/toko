import type { MoSize, MoState } from "@focusflow/mo";
import type { ParentMoodScore } from "@focusflow/validators";
import type { OnboardingGoal } from "@/stores/ui-store";

export type MoodId = "calme" | "trop-plein" | "fatigue" | "fierte" | "inquietude" | "silence";

/**
 * Humeurs de l'écran « Comment ça va, aujourd'hui ? ». Chaque carte garde le
 * pastel de la maquette validée. La réponse rejoint l'humeur du parent qui
 * existe déjà (`POST /api/parent-mood`, échelle 1 à 5 de l'accueil) :
 *   fatigue → 1 « Épuisé·e », trop-plein et inquiétude → 2 « Difficile »,
 *   calme → 4 « Bien », fierté → 5 « Très bien ».
 * « Je préfère ne pas dire » n'enregistre rien.
 */
export const MOODS: ReadonlyArray<{
  id: MoodId;
  state: MoState;
  surface: string;
  score: ParentMoodScore | null;
}> = [
  { id: "calme", state: "calme", surface: "bg-surface-mint", score: 4 },
  { id: "trop-plein", state: "trop-plein", surface: "bg-surface-peach", score: 2 },
  { id: "fatigue", state: "fatigue", surface: "bg-surface-lavender", score: 1 },
  { id: "fierte", state: "fierte", surface: "bg-surface-honey", score: 5 },
  { id: "inquietude", state: "inquietude", surface: "bg-surface-sky", score: 2 },
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

/** Les dessins à charger avant d'ouvrir l'onboarding (pas d'apparition en cours de route). */
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
