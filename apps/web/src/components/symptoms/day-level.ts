import { levelFromScore, type DayLevel } from "@focusflow/validators";

export { computeDayScore, levelFromScore, type DayLevel } from "@focusflow/validators";

export function levelFromValue(value: number, invert: boolean): DayLevel {
  return levelFromScore(invert ? 10 - value : value);
}

export const DAY_LEVEL_SURFACE: Readonly<Record<DayLevel, string>> = {
  good: "bg-surface-mint",
  ok: "bg-muted",
  hard: "bg-surface-peach",
};
