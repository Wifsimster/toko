export type MoodTrend = "up" | "down" | "stable" | null;

export type ChartPoint = {
  date: string;
  mood: number;
  focus: number;
  agitation: number;
};

export const BARKLEY_TOTAL_STEPS = 10;

export function moodLabelFor(score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null;
  if (score <= 3) return "Difficile";
  if (score <= 5) return "Moyen";
  if (score <= 7) return "Bien";
  return "Super";
}

export type ConsistencyTone = "none" | "good" | "mid" | "low";

export function consistencyTone(score: number | null | undefined): ConsistencyTone {
  if (score === null || score === undefined) return "none";
  if (score >= 70) return "good";
  if (score >= 40) return "mid";
  return "low";
}

export function valueOrDash(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${value}`;
}

export type BarkleyProgress = {
  completed: number;
  current: number;
  total: number;
  ratio: number;
  stars: number;
};

export function barkleyProgress(
  steps: ReadonlyArray<{ completedAt?: unknown }> | undefined,
  weeklyStars: number | undefined,
): BarkleyProgress | null {
  if (!steps) return null;
  const completed = steps.filter((s) => s.completedAt).length;
  const stars = weeklyStars ?? 0;
  if (completed === 0 && stars === 0) return null;
  return {
    completed,
    current: Math.min(completed + 1, BARKLEY_TOTAL_STEPS),
    total: BARKLEY_TOTAL_STEPS,
    ratio: Math.min(completed / BARKLEY_TOTAL_STEPS, 1),
    stars,
  };
}

export const CHART_MAX = 10;

export type ChartSeriesKey = "mood" | "focus" | "agitation";

export type ChartGeometry = {
  labels: string[];
  series: Record<ChartSeriesKey, { x: number; y: number }[]>;
};

export function chartGeometry(
  data: ReadonlyArray<ChartPoint>,
  width: number,
  height: number,
  dayLabel: (date: string) => string,
): ChartGeometry {
  const n = data.length;
  const xAt = (i: number) => ((i + 0.5) / n) * width;
  const yAt = (v: number) => height - (Math.max(0, Math.min(v, CHART_MAX)) / CHART_MAX) * height;
  const build = (key: ChartSeriesKey) => data.map((p, i) => ({ x: xAt(i), y: yAt(p[key]) }));
  return {
    labels: data.map((p) => dayLabel(p.date)),
    series: { mood: build("mood"), focus: build("focus"), agitation: build("agitation") },
  };
}

export function linePath(points: ReadonlyArray<{ x: number; y: number }>): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

export function areaPath(points: ReadonlyArray<{ x: number; y: number }>, baseline: number): string {
  if (points.length < 2) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)} L${last.x.toFixed(1)} ${baseline.toFixed(1)} L${first.x.toFixed(1)} ${baseline.toFixed(1)} Z`;
}

export function chartSummary(data: ReadonlyArray<ChartPoint>): string {
  const last = data[data.length - 1];
  if (!last) return "";
  return `Dernier relevé : régulation émotionnelle ${last.mood} sur 10, concentration ${last.focus} sur 10, agitation ${last.agitation} sur 10`;
}

const DAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function weekdayShortFr(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return DAYS_SHORT[new Date(y, m - 1, d).getDay()] ?? iso;
}
