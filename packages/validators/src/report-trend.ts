export type ReportDimension = "mood" | "focus" | "agitation" | "impulse" | "sleep";

export const REPORT_DIMENSIONS: readonly ReportDimension[] = ["mood", "focus", "agitation", "impulse", "sleep"];

export const REPORT_DIMENSION_LABELS: Record<ReportDimension, string> = {
  mood: "Humeur",
  focus: "Concentration",
  agitation: "Agitation",
  impulse: "Impulsivité",
  sleep: "Sommeil",
};

export const REPORT_HIGHER_IS_BETTER: ReadonlySet<ReportDimension> = new Set(["mood", "focus", "sleep"]);

export const REPORT_TREND_MIN_READINGS = 4;
export const REPORT_TREND_STABLE_THRESHOLD = 0.3;

export type ReportTrend = { delta: number; better: boolean | null };

type ReportSymptomPoint = { date: string | Date } & Partial<Record<ReportDimension, number | null>>;

export function reportDimensionValues(
  symptoms: ReadonlyArray<ReportSymptomPoint>,
  key: ReportDimension,
): number[] {
  return symptoms
    .filter((s) => typeof s[key] === "number" && Number.isFinite(s[key]))
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((s) => s[key] as number);
}

export function reportDimensionTrend(
  symptoms: ReadonlyArray<ReportSymptomPoint>,
  key: ReportDimension,
): ReportTrend | null {
  const points = reportDimensionValues(symptoms, key);
  if (points.length < REPORT_TREND_MIN_READINGS) return null;
  const mid = Math.floor(points.length / 2);
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const delta = mean(points.slice(mid)) - mean(points.slice(0, mid));
  if (Math.abs(delta) < REPORT_TREND_STABLE_THRESHOLD) return { delta, better: null };
  const rising = delta > 0;
  return { delta, better: REPORT_HIGHER_IS_BETTER.has(key) ? rising : !rising };
}

export type ReportTrendTone = "better" | "worse" | "stable";

export interface ReportTrendView {
  arrow: "↑" | "↓" | "→";
  word: "Amélioration" | "Aggravation" | "Stable";
  delta: string;
  tone: ReportTrendTone;
}

export function formatReportScore(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function formatReportDelta(value: number): string {
  const abs = formatReportScore(Math.abs(value));
  if (abs === "0,0") return abs;
  return `${value > 0 ? "+" : "−"}${abs}`;
}

export function reportTrendView(trend: ReportTrend | null): ReportTrendView | null {
  if (!trend) return null;
  const delta = formatReportDelta(trend.delta);
  if (trend.better === null) return { arrow: "→", word: "Stable", delta, tone: "stable" };
  const arrow = trend.delta > 0 ? "↑" : "↓";
  if (trend.better) return { arrow, word: "Amélioration", delta, tone: "better" };
  return { arrow, word: "Aggravation", delta, tone: "worse" };
}
