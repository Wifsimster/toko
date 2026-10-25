import type { MoState } from "@focusflow/mo";

/**
 * Seule table entre l'humeur du parent (échelle 1 à 5 de `POST
 * /api/parent-mood`, libellés `parentMood.scoreLabel`) et l'état de Mō qui
 * la montre. L'onboarding (cartes d'humeur) et l'accueil (« Et vous ? »)
 * la lisent tous deux : un même score affiche le même Mō partout.
 * Le pastel garde son sens fixe (DESIGN.md, « Pastels à sens fixe »).
 */
/** Les cinq niveaux du validateur `parentMoodScoreSchema` (entier de 1 à 5). */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export const PARENT_MOOD_FACES: Readonly<Record<MoodScore, { state: MoState; surface: string }>> = {
  1: { state: "fatigue", surface: "bg-surface-lavender" },
  2: { state: "trop-plein", surface: "bg-surface-peach" },
  3: { state: "inquietude", surface: "bg-surface-sky" },
  4: { state: "calme", surface: "bg-surface-mint" },
  5: { state: "fierte", surface: "bg-surface-honey" },
};

export const PARENT_MOOD_SCORES = [1, 2, 3, 4, 5] as const satisfies readonly MoodScore[];
