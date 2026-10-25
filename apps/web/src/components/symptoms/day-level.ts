import type { Symptom } from "@focusflow/validators";

export type DayLevel = "good" | "ok" | "hard";

/**
 * Note globale de la journée sur 0 à 10, 10 étant la meilleure. Agitation
 * et impulsivité sont inversées pour que « plus haut » veuille toujours dire
 * « mieux ».
 */
export function computeDayScore(s: Symptom): number {
  const sum = s.mood + s.focus + s.sleep + (10 - s.agitation) + (10 - s.impulse);
  return sum / 5;
}

export function levelFromScore(score: number): DayLevel {
  if (score >= 7) return "good";
  if (score >= 4) return "ok";
  return "hard";
}

/** Niveau d'une dimension ; `invert` pour celles où « haut » est difficile. */
export function levelFromValue(value: number, invert: boolean): DayLevel {
  return levelFromScore(invert ? 10 - value : value);
}

/**
 * Pastel de chaque niveau, sans Mō (un seul Mō par écran, DIRECTION.md).
 * Le niveau est calculé par l'app à partir des curseurs : il ne prend pas
 * les visages d'humeur du parent. Sens fixes (DESIGN.md, « Pastels ») :
 * - bonne journée → menthe (calme) ;
 * - journée mitigée → sable (`muted`), neutre : c'est la journée ordinaire ;
 * - journée difficile → pêche (crise).
 * Le ciel reste au soir. Encre sur chacun : plus de 11:1 (AA : 4,5:1).
 */
export const DAY_LEVEL_SURFACE: Readonly<Record<DayLevel, string>> = {
  good: "bg-surface-mint",
  ok: "bg-muted",
  hard: "bg-surface-peach",
};
