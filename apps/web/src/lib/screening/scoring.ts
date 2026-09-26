import type { Item, Questionnaire } from "./questionnaires";

export type Answers = ReadonlyArray<number | null>;

/** "high" = seuil atteint ; "some" = à 2 signes du seuil ; "low" = en dessous. */
export type Level = "high" | "some" | "low";

export interface DimensionResult {
  id: string;
  count: number;
  total: number;
  threshold: number;
  level: Level;
}

export interface ScreeningResult {
  level: Level;
  dimensions: DimensionResult[];
}

export function isPositive(item: Item, answer: number | null): boolean {
  if (answer === null) return false;
  return "gte" in item.positive
    ? answer >= item.positive.gte
    : answer <= item.positive.lte;
}

function levelFor(count: number, threshold: number): Level {
  if (count >= threshold) return "high";
  if (count >= threshold - 2) return "some";
  return "low";
}

const RANK: Record<Level, number> = { low: 0, some: 1, high: 2 };

export function score(q: Questionnaire, answers: Answers): ScreeningResult {
  const dimensions = q.dimensions.map((d) => {
    const indexes = q.items
      .map((item, i) => (item.dimension === d.id ? i : -1))
      .filter((i) => i >= 0);
    const count = indexes.filter((i) => isPositive(q.items[i]!, answers[i] ?? null)).length;
    return {
      id: d.id,
      count,
      total: indexes.length,
      threshold: d.threshold,
      level: levelFor(count, d.threshold),
    };
  });
  const level = dimensions.reduce<Level>(
    (acc, d) => (RANK[d.level] > RANK[acc] ? d.level : acc),
    "low",
  );
  return { level, dimensions };
}
