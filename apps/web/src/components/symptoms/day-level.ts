import type { Symptom } from "@focusflow/validators";

export type DayLevel = "good" | "ok" | "hard";

export function computeDayScore(s: Symptom): number {
  const sum = s.mood + s.focus + s.sleep + (10 - s.agitation) + (10 - s.impulse);
  return sum / 5;
}

export function levelFromScore(score: number): DayLevel {
  if (score >= 7) return "good";
  if (score >= 4) return "ok";
  return "hard";
}

export function levelFromValue(value: number, invert: boolean): DayLevel {
  return levelFromScore(invert ? 10 - value : value);
}

export const DAY_LEVEL_SURFACE: Readonly<Record<DayLevel, string>> = {
  good: "bg-surface-mint",
  ok: "bg-muted",
  hard: "bg-surface-peach",
};
