import { inflateSync } from "node:zlib";
import { describe, it, expect } from "vitest";
import {
    buildReportPdf,
    buildReportHtml,
    type ReportData,
} from "../lib/report";

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
            mood: lin(4, 8, i),
            focus: lin(8, 4, i),
            agitation: lin(7, 3, i),
            impulse: lin(3, 7, i),
            sleep: 5,
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
        expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    });

    it("renders the trend column and valence in the HTML report", () => {
        const html = buildReportHtml(fixture());
        expect(html).toContain("Tendance");
        expect(html).toContain("Amélioration");
        expect(html).toContain("Aggravation");
        expect(html).toContain("Stable");
    });
});

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

describe("crisis list icons", () => {
    it("replaces the emoji with an inline svg icon in the HTML report", () => {
        const data = fixture();
        data.crisisItems = [
            { label: "Câlin doudou", emoji: "🧸", position: 0 },
            { label: "Licorne", emoji: "🦄", position: 1 },
            { label: "Sans emoji", emoji: null, position: 2 },
        ];
        const html = buildReportHtml(data);
        expect(html).not.toContain("🧸");
        expect(html).not.toContain("🦄");
        expect(html).toContain("Câlin doudou");
        expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(3);
        expect(html).toContain("M13 16a3 3 0 0 1 2.24 5");
        expect(html).toContain("M2 9.5a5.5 5.5 0 0 1 9.591-3.676");
    });

    it("draws vector strokes next to the label in the PDF", async () => {
        const withIcons = fixture();
        const without = { ...fixture(), crisisItems: [] };
        const a = await buildReportPdf(withIcons);
        const b = await buildReportPdf(without);
        expect(pdfTextLines(a).some((l) => l.includes("1. Respirer 5 fois"))).toBe(true);
        expect(pdfContent(a)).toMatch(/\bS\b/);
        expect(pdfContent(a).length).toBeGreaterThan(pdfContent(b).length);
    });
});

describe("multi-page PDF footer", () => {
    it("stamps the footer on every page with the right page count", async () => {
        const pdf = await buildReportPdf(longFixture());
        const lines = pdfTextLines(pdf);
        const footers = lines.filter((l) => /Page \d+\/\d+/.test(l));
        const pages = countPdfPages(pdf);

        expect(pages).toBeGreaterThan(1);
        expect(footers).toHaveLength(pages);
        footers.forEach((line, i) => {
            expect(line).toContain(`Page ${i + 1}/${pages}`);
        });
    });

    it("does not append blank pages while drawing the footers", async () => {
        const pdf = await buildReportPdf(longFixture());
        const pages = countPdfPages(pdf);
        const bodyLines = pdfTextLines(pdf).filter(
            (l) => l.trim() !== "" && !/Page \d+\/\d+/.test(l),
        );
        expect(bodyLines.length).toBeGreaterThan(pages * 2);
    });
});

function countPdfPages(pdf: Buffer): number {
    return (pdf.toString("latin1").match(/\/Type \/Page[^s]/g) ?? []).length;
}

function pdfContent(pdf: Buffer): string {
    const raw = pdf.toString("latin1");
    let ops = "";
    for (const m of raw.matchAll(/stream\r?\n/g)) {
        const start = m.index! + m[0].length;
        const end = raw.indexOf("endstream", start);
        if (end < 0) continue;
        try {
            ops += inflateSync(Buffer.from(raw.slice(start, end), "latin1")).toString("latin1");
        } catch {
        }
    }
    return ops;
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
        }
    }
    return Array.from(ops.matchAll(/\[([^\]]*)\]\s*TJ/g)).map((group) =>
        Array.from(group[1]!.matchAll(/<([0-9a-fA-F]*)>/g))
            .map((hex) => Buffer.from(hex[1]!, "hex").toString("latin1"))
            .join(""),
    );
}

describe("report synthesis", () => {
    it("counts distinct days (not entries) for « Jours suivis »", () => {
        const data = fixture();
        data.symptoms = [...data.symptoms, ...data.symptoms];
        const html = buildReportHtml(data);
        expect(html).toMatch(/>20<\/div>\s*<div[^>]*>Jours suivis/);
    });
});
