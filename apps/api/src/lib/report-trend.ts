// Symptom-trend logic for the medical report, extracted so the clinical
// valence (is a change an improvement or a worsening?) is unit-testable
// without a database or a PDF/HTML renderer.

export type SymptomDim = "mood" | "focus" | "agitation" | "impulse" | "sleep";

// Dimensions where a higher score is clinically better (mood/focus/sleep);
// the others (agitation/impulse) are better when lower.
export const HIGHER_IS_BETTER: ReadonlySet<SymptomDim> = new Set([
    "mood",
    "focus",
    "sleep",
]);

export type DimensionTrend = { delta: number; better: boolean | null };

type SymptomPoint = { date: string | Date } & Partial<Record<SymptomDim, number | null>>;

// Compares the average of the second half of the (date-sorted) readings to the
// first half. `better` is null when the change is negligible or there aren't
// enough readings to split meaningfully.
export function dimensionTrend(
    symptoms: ReadonlyArray<SymptomPoint>,
    key: SymptomDim,
): DimensionTrend | null {
    const points = symptoms
        .filter((s) => typeof s[key] === "number" && (s[key] as number) > 0)
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

// Label + hex color for a trend cell, shared by the PDF and HTML reports.
export function trendDisplay(trend: DimensionTrend | null): {
    label: string;
    color: string;
} {
    if (!trend) return { label: "—", color: "#9ca3af" };
    const signed = `${trend.delta >= 0 ? "+" : "-"}${Math.abs(trend.delta).toFixed(1)}`;
    if (trend.better === null) return { label: `Stable (${signed})`, color: "#6b7280" };
    if (trend.better) return { label: `Amélioration (${signed})`, color: "#059669" };
    return { label: `Aggravation (${signed})`, color: "#dc2626" };
}
