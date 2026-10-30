export type SymptomDim = "mood" | "focus" | "agitation" | "impulse" | "sleep";

export const HIGHER_IS_BETTER: ReadonlySet<SymptomDim> = new Set([
    "mood",
    "focus",
    "sleep",
]);

export type DimensionTrend = { delta: number; better: boolean | null };

type SymptomPoint = { date: string | Date } & Partial<Record<SymptomDim, number | null>>;

export function dimensionTrend(
    symptoms: ReadonlyArray<SymptomPoint>,
    key: SymptomDim,
): DimensionTrend | null {
    const points = symptoms
        .filter((s) => typeof s[key] === "number" && Number.isFinite(s[key]))
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .map((s) => s[key] as number);
    if (points.length < 4) return null;
    const mid = Math.floor(points.length / 2);
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const delta = mean(points.slice(mid)) - mean(points.slice(0, mid));
    if (Math.abs(delta) < 0.3) return { delta, better: null };
    const rising = delta > 0;
    return { delta, better: HIGHER_IS_BETTER.has(key) ? rising : !rising };
}

export function trendDisplay(trend: DimensionTrend | null): {
    label: string;
    color: string;
} {
    if (!trend) return { label: "—", color: "#4F585E" };
    const signed = `${trend.delta >= 0 ? "+" : "-"}${Math.abs(trend.delta).toFixed(1)}`;
    if (trend.better === null) return { label: `Stable (${signed})`, color: "#4F585E" };
    if (trend.better) return { label: `Amélioration (${signed})`, color: "#047857" };
    return { label: `Aggravation (${signed})`, color: "#9B2C2C" };
}
