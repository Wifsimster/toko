import { describe, it, expect } from "vitest";
import {
    buildReportPdf,
    buildReportHtml,
    type ReportData,
} from "../routes/report";

// A 20-day fixture where each dimension moves in a known direction, so we can
// assert the trend column renders the right valence without a database.
function fixture(): ReportData {
    const dates = Array.from(
        { length: 20 },
        (_, i) => `2026-03-${String(i + 1).padStart(2, "0")}`,
    );
    const lin = (a: number, b: number, i: number) =>
        Math.round(a + (b - a) * (i / 19));
    return {
        child: { name: "Lucas", gender: "male", ageRange: "6-8" },
        sinceDate: dates[0]!,
        untilDate: dates[19]!,
        symptoms: dates.map((date, i) => ({
            date,
            mood: lin(4, 8, i), // improving
            focus: lin(8, 4, i), // worsening
            agitation: lin(7, 3, i), // improving (lower is better)
            impulse: lin(3, 7, i), // worsening (higher is worse)
            sleep: 5, // stable
        })),
        journal: [{ date: dates[5]!, text: "Plus concentré en classe.", tags: ["school"] }],
        barkleySteps: [{ stepNumber: 1, completedAt: new Date("2026-03-05") }],
        crisisItems: [{ label: "Respirer 5 fois", emoji: "🫧", position: 0 }],
        medications: [
            {
                name: "Méthylphénidate",
                dose: "18 mg",
                schedule: "morning",
                startDate: dates[0]!,
                endDate: null,
                notes: "Bonne tolérance",
                active: true,
                adherence: { taken: 18, total: 20 },
            },
        ],
        carePathway: [
            { stepId: "gp_consultation", status: "done", notes: null, completedAt: new Date("2026-03-03") },
        ],
        questions: "Faut-il ajuster la dose du soir ?",
        parentName: "Damien",
    };
}

describe("report rendering with the trend column", () => {
    it("builds a non-empty PDF without throwing", async () => {
        const pdf = await buildReportPdf(fixture());
        expect(pdf.length).toBeGreaterThan(1000);
        // PDF magic header
        expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    });

    it("renders the trend column and valence in the HTML report", () => {
        const html = buildReportHtml(fixture());
        expect(html).toContain("Tendance");
        expect(html).toContain("Amélioration"); // mood up / agitation down
        expect(html).toContain("Aggravation"); // focus down / impulse up
        expect(html).toContain("Stable"); // sleep flat
    });
});
