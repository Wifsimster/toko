import { readFileSync } from "node:fs";
import PDFDocument from "pdfkit";
import { describe, expect, it } from "vitest";
import { buildReportPdf, type ReportData } from "../lib/report";
import { LOGO_MARK, LOGO_WORDMARK } from "../lib/report/pdf/brand";
import { childMeta, synthesisCards, trendView } from "../lib/report/pdf/sections";
import {
    FONT_COVERAGE,
    PDF_FONT,
    PDF_MARGIN,
    PDF_SURFACE,
    pdfSafeText,
    registerBrandFonts,
    sectionTitle,
    type PDFDoc,
} from "../lib/report/pdf/theme";
import { countPdfPages, pdfFontNames, pdfTextRuns } from "./helpers/pdf-text";

function fixture(): ReportData {
    const dates = Array.from({ length: 20 }, (_, i) => `2026-03-${String(i + 1).padStart(2, "0")}`);
    return {
        child: { name: "Lucas", gender: "male", ageRange: "6-8" },
        sinceDate: dates[0]!,
        untilDate: dates[19]!,
        symptoms: dates.map((date, i) => ({ date, mood: 4 + (i > 9 ? 3 : 0), focus: 6, agitation: 5, impulse: 5, sleep: 6 })),
        journal: [{ date: dates[3]!, text: "Grosse colère.", tags: ["crisis"] }],
        barkleySteps: [{ stepNumber: 1, completedAt: new Date("2026-03-05") }],
        crisisItems: [{ label: "Respirer 5 fois", emoji: "🫧", position: 0 }],
        medications: [],
        questions: "",
        parentName: "Camille",
    };
}

function emptyFixture(): ReportData {
    return {
        ...fixture(),
        symptoms: [],
        journal: [],
        barkleySteps: [],
        crisisItems: [],
        medications: [],
    };
}

function stressFixture(): ReportData {
    const base = fixture();
    return {
        ...base,
        child: { name: "Marie-Charlotte-Éléonore de La Tour d'Auvergne 🦄", gender: "female", ageRange: "9-11" },
        barkleySteps: Array.from({ length: 10 }, (_, i) => ({ stepNumber: i + 1, completedAt: new Date(Date.UTC(2026, 2, 1 + i)) })),
        crisisItems: Array.from({ length: 30 }, (_, i) => ({
            label: `Stratégie ${i + 1} : ${"respirer lentement, ".repeat(i % 3 === 0 ? 8 : 1)}`,
            emoji: "🧸",
            position: i,
        })),
        journal: Array.from({ length: 25 }, (_, i) => ({ date: base.symptoms[i % 20]!.date, text: "Note longue. ".repeat(40), tags: [] })),
        parentName: "Jean-Baptiste-Alexandre Montgolfier-Desrosiers de Saint-Exupéry",
    };
}

describe("report PDF brand fonts", () => {
    it("embeds Plus Jakarta Sans in three weights and no standard Helvetica", async () => {
        const fonts = pdfFontNames(await buildReportPdf(fixture()));
        expect(fonts.some((f) => f.endsWith("+PlusJakartaSans-Regular"))).toBe(true);
        expect(fonts.some((f) => f.endsWith("+PlusJakartaSans-SemiBold"))).toBe(true);
        expect(fonts.some((f) => f.endsWith("+PlusJakartaSans-ExtraBold"))).toBe(true);
        expect(fonts.some((f) => f.includes("Helvetica"))).toBe(false);
    });

    it("declares a coverage table that matches the glyphs of every embedded weight", () => {
        const doc = new PDFDocument({ autoFirstPage: false }) as PDFDoc;
        registerBrandFonts(doc);
        for (const name of Object.values(PDF_FONT)) {
            doc.font(name);
            const font = (doc as unknown as { _font: { font: { hasGlyphForCodePoint(cp: number): boolean } } })._font.font;
            for (const [start, end] of FONT_COVERAGE) {
                for (let cp = start; cp <= end; cp++) {
                    expect(font.hasGlyphForCodePoint(cp), `${name} U+${cp.toString(16)}`).toBe(true);
                }
            }
        }
    });

    it("keeps French text and the macron, drops emoji and degrades unknown letters", () => {
        expect(pdfSafeText("Tokō : Éléonore, cœur « ça va » – 3 €")).toBe("Tokō : Éléonore, cœur « ça va » – 3 €");
        expect(pdfSafeText("Lucas 🦄")).toBe("Lucas");
        expect(pdfSafeText("Câlin 👨‍👩‍👧 doudou ❤️")).toBe("Câlin doudou");
        expect(pdfSafeText("Nguyễn Thị")).toBe("Nguyen Thi");
        expect(pdfSafeText("Léa 李")).toBe("Léa ?");
        expect(pdfSafeText("le 2ᵉ jour, 1ʳᵉ fois, 3ᵈ")).toBe("le 2e jour, 1re fois, 3d");
        expect(pdfSafeText("l\u02bcécole \u02b9x")).toBe("l\u2019école 'x");
        expect(pdfSafeText("10\u202f000\u202f€ − 5 ‑ 3")).toBe("10 000 € − 5 - 3");
        expect(pdfSafeText("ﬁn № 3 ½ ℃")).toBe("fin No 3 ½ °C");
        expect(pdfSafeText("ａｂｃ １２")).toBe("abc 12");
        expect(pdfSafeText("2º 1ª « » œ ç – — …")).toBe("2º 1ª « » œ ç – — …");
        expect(pdfSafeText("a b c")).toBe("a b c");
    });

    it("never draws a glyph the font lacks, even with emoji in the child name", async () => {
        const runs = pdfTextRuns(await buildReportPdf(stressFixture()));
        expect(runs.join("")).not.toContain("�");
        expect(runs.join(" ")).toContain("Marie-Charlotte-Éléonore de La Tour");
    });
});

describe("report PDF page furniture", () => {
    it("repeats the disclaimer on every page and the running header from page 2", async () => {
        const pdf = await buildReportPdf(stressFixture());
        const pages = countPdfPages(pdf);
        const runs = pdfTextRuns(pdf);
        expect(pages).toBeGreaterThan(2);
        expect(runs.filter((r) => r.includes("Ce n'est pas un diagnostic médical."))).toHaveLength(pages);
        expect(runs.filter((r) => r.startsWith("Rapport de suivi · "))).toHaveLength(pages - 1);
        expect(runs.filter((r) => /^Page \d+ sur \d+$/.test(r))).toHaveLength(pages);
    });

    it("truncates a long parent name in the footer instead of wrapping it", async () => {
        const runs = pdfTextRuns(await buildReportPdf(stressFixture()));
        const info = runs.filter((r) => r.startsWith("Rapport généré le "));
        expect(info.length).toBeGreaterThan(0);
        info.forEach((r) => expect(r.endsWith("…")).toBe(true));
    });

    it("shows the child, the period and the generation date on the cover band", async () => {
        const runs = pdfTextRuns(await buildReportPdf(fixture()));
        expect(runs).toContain("RAPPORT DE SUIVI TDAH");
        expect(runs).toContain("Lucas");
        expect(runs).toContain("Garçon · 6 à 8 ans");
        expect(runs).toContain("Du 1 mars 2026");
        expect(runs).toContain("au 20 mars 2026");
        expect(runs).toContain("GÉNÉRÉ LE");
    });

    it("moves a section title to the next page instead of leaving it alone at the bottom", () => {
        const doc = new PDFDocument({ size: "A4", margins: { ...PDF_MARGIN }, bufferPages: true }) as PDFDoc;
        registerBrandFonts(doc);
        doc.y = doc.page.height - PDF_MARGIN.bottom - 40;
        sectionTitle(doc, "Liste de crise");
        expect(doc.bufferedPageRange().count).toBe(2);
        expect(doc.y).toBeLessThan(PDF_MARGIN.top + 40);
    });
});

describe("report PDF sections", () => {
    it("puts each synthesis card on the pastel of its fixed meaning", () => {
        const cards = synthesisCards({ ...fixture(), medications: [] });
        const surfaceOf = (label: string) => cards.find((c) => c.label === label)?.surface;
        expect(surfaceOf("Jours suivis")).toBe("mint");
        expect(surfaceOf("Crises notées")).toBe("peach");
        expect(surfaceOf("Étapes Barkley")).toBe("lavender");
        expect(cards.filter((c) => c.surface === "peach")).toHaveLength(1);
        expect(cards.filter((c) => c.surface === "lavender")).toHaveLength(1);
        cards.forEach((c) => expect(Object.keys(PDF_SURFACE)).toContain(c.surface));
    });

    it("spells the trend with an arrow and a word, not only a colour", () => {
        expect(trendView(null)).toBeNull();
        expect(trendView({ delta: 1.7, better: true })).toMatchObject({ arrow: "↑", word: "Amélioration", delta: "+1,7" });
        expect(trendView({ delta: -1.7, better: true })).toMatchObject({ arrow: "↓", word: "Amélioration", delta: "−1,7" });
        expect(trendView({ delta: 1.2, better: false })).toMatchObject({ arrow: "↑", word: "Aggravation" });
        expect(trendView({ delta: 0.1, better: null })).toMatchObject({ arrow: "→", word: "Stable", delta: "+0,1" });
    });

    it("describes the child without leaking raw enum values", () => {
        expect(childMeta({ name: "A", gender: "female", ageRange: "12-14" })).toBe("Fille · 12 à 14 ans");
        expect(childMeta({ name: "A", gender: "other", ageRange: null })).toBe("");
    });

    it("renders an explicit empty state for every section when there is no data", async () => {
        const pdf = await buildReportPdf(emptyFixture());
        const runs = pdfTextRuns(pdf);
        expect(countPdfPages(pdf)).toBe(1);
        for (const message of [
            "Aucun relevé de symptômes sur cette période.",
            "Aucun traitement renseigné.",
            "Aucune entrée de journal sur cette période.",
            "Programme pas encore commencé.",
            "Aucune stratégie de régulation enregistrée.",
        ]) {
            expect(runs).toContain(message);
        }
        expect(runs).toContain("0/10");
    });

    it("lists every Barkley step and every crisis item in the stress case", async () => {
        const runs = pdfTextRuns(await buildReportPdf(stressFixture()));
        expect(runs).toContain("10 étapes terminées sur 10");
        for (let n = 1; n <= 10; n++) expect(runs).toContain(`Étape ${n}`);
        for (let n = 1; n <= 30; n++) expect(runs).toContain(`${n}. `);
        expect(runs).toContain("LISTE DE CRISE (SUITE)");
    });
});

describe("report PDF journal continuation", () => {
    it("marks a journal entry that breaks across pages with the section continuation header", async () => {
        const base = fixture();
        const words = Array.from({ length: 700 }, (_, i) => `mot${i}`).join(" ");
        const long = { ...base, journal: [{ date: base.symptoms[0]!.date, text: words, tags: [] }] };
        const runs = pdfTextRuns(await buildReportPdf(long));
        expect(runs.filter((r) => r === "MOMENTS MARQUANTS DU JOURNAL (SUITE)").length).toBeGreaterThanOrEqual(1);
        expect(runs.join(" ")).toContain("mot699");

        const short = { ...base, journal: [{ date: base.symptoms[0]!.date, text: "Une courte note.", tags: [] }] };
        expect(pdfTextRuns(await buildReportPdf(short))).not.toContain("MOMENTS MARQUANTS DU JOURNAL (SUITE)");
    });
});

describe("report PDF logo", () => {
    it("draws the exact paths of brand/toko-logo.svg", () => {
        const svg = readFileSync(new URL("../../../../brand/toko-logo.svg", import.meta.url), "utf8");
        const paths = Array.from(svg.matchAll(/<path transform="translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)" d="([^"]+)"/g));
        expect(paths).toHaveLength(2);
        const [mark, word] = paths;
        expect([Number(mark![1]), Number(mark![2])]).toEqual(LOGO_MARK.translate);
        expect(Number(mark![3])).toBe(LOGO_MARK.scale);
        expect(mark![4]).toBe(LOGO_MARK.path);
        expect([Number(word![1]), Number(word![2])]).toEqual(LOGO_WORDMARK.translate);
        expect(Number(word![3])).toBe(LOGO_WORDMARK.scale);
        expect(word![4]).toBe(LOGO_WORDMARK.path);
    });
});
