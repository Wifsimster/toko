import { inflateSync } from "node:zlib";
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

// A fixture heavy enough to spill over several pages, so the per-page footer
// and its "Page x/y" counter are actually exercised.
function longFixture(): ReportData {
    const base = fixture();
    return {
        ...base,
        journal: Array.from({ length: 40 }, (_, i) => ({
            date: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
            text: "Longue note de journal. ".repeat(30),
            tags: ["crisis"],
        })),
        crisisItems: Array.from({ length: 25 }, (_, i) => ({
            label: `Stratégie de régulation numéro ${i + 1}`,
            emoji: "🫧",
            position: i,
        })),
        questions: "Une question pour le médecin. ".repeat(40),
    };
}

// PDFKit only keeps every page addressable when the document is created with
// `bufferPages: true`; without it `bufferedPageRange()` covers the last page
// alone, so the footer landed once and always read "Page 1/1". The footer also
// draws inside the bottom margin, which PDFKit treats as an overflow (and
// silently appends a blank page) unless that margin is zeroed while writing.
describe("multi-page PDF footer", () => {
    it("stamps the footer on every page with the right page count", async () => {
        const pdf = await buildReportPdf(longFixture());
        const lines = pdfTextLines(pdf);
        const footers = lines.filter((l) => /Page \d+\/\d+/.test(l));
        const pages = countPdfPages(pdf);

        expect(pages).toBeGreaterThan(1);
        // One footer per page, numbered 1..N over the same total.
        expect(footers).toHaveLength(pages);
        footers.forEach((line, i) => {
            expect(line).toContain(`Page ${i + 1}/${pages}`);
        });
    });

    it("does not append blank pages while drawing the footers", async () => {
        const pdf = await buildReportPdf(longFixture());
        const pages = countPdfPages(pdf);
        // Every page carries content: the footer alone would leave a page with
        // only the two footer lines, so assert each page has real body text.
        const bodyLines = pdfTextLines(pdf).filter(
            (l) => l.trim() !== "" && !/Page \d+\/\d+/.test(l),
        );
        expect(bodyLines.length).toBeGreaterThan(pages * 2);
    });
});

// ─── PDF inspection helpers ───────────────────────────────
// PDFKit deflates each page's content stream and writes text as hex literals
// inside `[...] TJ` arrays; both have to be undone to read the rendered text.

function countPdfPages(pdf: Buffer): number {
    return (pdf.toString("latin1").match(/\/Type \/Page[^s]/g) ?? []).length;
}

function pdfTextLines(pdf: Buffer): string[] {
    const raw = pdf.toString("latin1");
    let ops = "";
    for (const m of raw.matchAll(/stream\r?\n/g)) {
        const start = m.index! + m[0].length;
        const end = raw.indexOf("endstream", start);
        if (end < 0) continue;
        try {
            ops += inflateSync(
                Buffer.from(raw.slice(start, end), "latin1"),
            ).toString("latin1");
        } catch {
            // Not a deflate stream (fonts, images) — nothing to read.
        }
    }
    return Array.from(ops.matchAll(/\[([^\]]*)\]\s*TJ/g)).map((group) =>
        Array.from(group[1]!.matchAll(/<([0-9a-fA-F]*)>/g))
            .map((hex) => Buffer.from(hex[1]!, "hex").toString("latin1"))
            .join(""),
    );
}
