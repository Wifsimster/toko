import { describe, it, expect } from "vitest";
import {
    dimensionTrend,
    trendDisplay,
} from "../lib/report-trend";

// Build date-sorted-ish readings; dimensionTrend sorts internally.
function series(dim: string, values: number[]) {
    return values.map((v, i) => ({
        date: `2026-01-${String(i + 1).padStart(2, "0")}`,
        [dim]: v,
    }));
}

describe("dimensionTrend", () => {
    it("returns null when there are too few readings to split", () => {
        expect(dimensionTrend(series("mood", [5, 6, 7]), "mood")).toBeNull();
    });

    it("flags a rising higher-is-better dimension as an improvement", () => {
        // mood: first half ~4, second half ~7 → up → better
        const t = dimensionTrend(series("mood", [4, 4, 7, 7]), "mood");
        expect(t?.better).toBe(true);
        expect(t?.delta).toBeGreaterThan(0);
    });

    it("flags a falling higher-is-better dimension as a worsening", () => {
        const t = dimensionTrend(series("focus", [8, 8, 4, 4]), "focus");
        expect(t?.better).toBe(false);
    });

    it("flags a FALLING lower-is-better dimension as an improvement", () => {
        // agitation going down is good
        const t = dimensionTrend(series("agitation", [8, 8, 4, 4]), "agitation");
        expect(t?.better).toBe(true);
        expect(t?.delta).toBeLessThan(0);
    });

    it("flags a RISING lower-is-better dimension as a worsening", () => {
        const t = dimensionTrend(series("impulse", [3, 3, 7, 7]), "impulse");
        expect(t?.better).toBe(false);
    });

    it("reports a negligible change as stable (better = null)", () => {
        const t = dimensionTrend(series("sleep", [5, 5, 5, 5]), "sleep");
        expect(t?.better).toBeNull();
    });

    it("ignores zero/absent readings when splitting", () => {
        const t = dimensionTrend(series("mood", [0, 4, 4, 7, 7]), "mood");
        expect(t?.better).toBe(true);
    });
});

describe("trendDisplay", () => {
    it("renders a dash for no trend", () => {
        expect(trendDisplay(null).label).toBe("—");
    });
    it("colors an improvement green and a worsening red", () => {
        expect(trendDisplay({ delta: 1.2, better: true }).color).toBe("#059669");
        expect(trendDisplay({ delta: -1.2, better: false }).color).toBe("#dc2626");
    });
    it("shows the signed delta", () => {
        expect(trendDisplay({ delta: 0.8, better: true }).label).toContain("+0.8");
        expect(trendDisplay({ delta: -0.6, better: true }).label).toContain("-0.6");
    });
});
