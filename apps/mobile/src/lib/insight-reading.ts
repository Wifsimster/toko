export type ReadingDimension = "mood" | "focus" | "agitation" | "impulse" | "sleep";
export type ReadingPoint = { date: string } & Record<ReadingDimension, number>;
export type Reading = { dimension: ReadingDimension; direction: "better" | "harder" } | null;

const DIMENSIONS: readonly ReadingDimension[] = ["agitation", "mood", "focus", "sleep", "impulse"];
const LOWER_IS_BETTER: ReadonlySet<ReadingDimension> = new Set(["agitation", "impulse"]);
export const READING_MIN_DAYS = 4;
export const READING_MIN_DELTA = 1;

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function readTrend(points: readonly ReadingPoint[], todayIso: string): Reading {
  const recentFrom = shiftIso(todayIso, -13);
  const previousFrom = shiftIso(todayIso, -27);
  const recent = points.filter((p) => p.date >= recentFrom && p.date <= todayIso);
  const previous = points.filter((p) => p.date >= previousFrom && p.date < recentFrom);
  if (recent.length < READING_MIN_DAYS || previous.length < READING_MIN_DAYS) return null;

  let best: { dimension: ReadingDimension; gain: number } | null = null;
  for (const dimension of DIMENSIONS) {
    const delta = mean(recent.map((p) => p[dimension])) - mean(previous.map((p) => p[dimension]));
    const gain = LOWER_IS_BETTER.has(dimension) ? -delta : delta;
    if (Math.abs(gain) < READING_MIN_DELTA) continue;
    if (!best || Math.abs(gain) > Math.abs(best.gain)) {
      best = { dimension, gain };
    }
  }
  if (!best) return null;
  return { dimension: best.dimension, direction: best.gain > 0 ? "better" : "harder" };
}
