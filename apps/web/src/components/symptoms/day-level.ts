import type { Symptom } from "@focusflow/validators";
import type { MoodScore } from "@/components/mo/parent-mood-faces";

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
 * Le niveau de la journée, lu sur la table d'humeurs partagée
 * (`PARENT_MOOD_FACES`) : le Mō et le pastel du relevé sont ceux de
 * l'humeur équivalente du parent. Le relevé est saisi par le parent : Mō
 * reflète ce choix (états négatifs permis, DESIGN.md « Mō »).
 * - bonne journée → 4 calme, menthe
 * - journée mitigée → 3 inquiétude, ciel
 * - journée difficile → 2 trop-plein, pêche
 */
export const DAY_LEVEL_MOOD: Readonly<Record<DayLevel, MoodScore>> = {
  good: 4,
  ok: 3,
  hard: 2,
};
