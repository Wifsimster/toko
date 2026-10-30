import { describe, expect, it } from "vitest";
import {
  formatReportDelta,
  formatReportScore,
  reportDimensionTrend,
  reportTrendView,
  type ReportDimension,
} from "../report-trend";

function series(dim: ReportDimension, values: number[]) {
  return values.map((v, i) => ({ date: `2026-01-${String(i + 1).padStart(2, "0")}`, [dim]: v }));
}

describe("reportDimensionTrend", () => {
  it("returns null under four readings", () => {
    expect(reportDimensionTrend(series("mood", [5, 6, 7]), "mood")).toBeNull();
  });

  it("reads a rising higher-is-better dimension as an improvement", () => {
    expect(reportDimensionTrend(series("mood", [4, 4, 7, 7]), "mood")?.better).toBe(true);
  });

  it("reads a falling lower-is-better dimension as an improvement", () => {
    const t = reportDimensionTrend(series("agitation", [8, 8, 4, 4]), "agitation");
    expect(t?.better).toBe(true);
    expect(t?.delta).toBeLessThan(0);
  });

  it("reads a rising lower-is-better dimension as a worsening", () => {
    expect(reportDimensionTrend(series("impulse", [3, 3, 7, 7]), "impulse")?.better).toBe(false);
  });

  it("reads a change under 0.3 point as stable", () => {
    expect(reportDimensionTrend(series("sleep", [5, 5, 5.2, 5.2]), "sleep")?.better).toBeNull();
  });

  it("sorts readings by date before splitting", () => {
    const points = [
      { date: "2026-01-04", mood: 7 },
      { date: "2026-01-01", mood: 4 },
      { date: "2026-01-03", mood: 7 },
      { date: "2026-01-02", mood: 4 },
    ];
    expect(reportDimensionTrend(points, "mood")?.better).toBe(true);
  });
});

describe("reportTrendView", () => {
  it("pairs the arrow (direction) with the word (meaning)", () => {
    expect(reportTrendView({ delta: -1.25, better: true })).toEqual({
      arrow: "↓",
      word: "Amélioration",
      delta: "−1,3",
      tone: "better",
    });
    expect(reportTrendView({ delta: 0.6, better: false })).toMatchObject({ arrow: "↑", word: "Aggravation", tone: "worse" });
    expect(reportTrendView({ delta: 0.1, better: null })).toMatchObject({ arrow: "→", word: "Stable", tone: "stable" });
    expect(reportTrendView(null)).toBeNull();
  });

  it("formats scores with a decimal comma", () => {
    expect(formatReportScore(5.46)).toBe("5,5");
    expect(formatReportDelta(0.04)).toBe("0,0");
    expect(formatReportDelta(0.4)).toBe("+0,4");
  });
});
