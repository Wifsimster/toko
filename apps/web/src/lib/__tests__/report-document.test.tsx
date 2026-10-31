import { createElement, type ComponentProps } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { BarkleyStep, Child, CrisisItem, Medication } from "@focusflow/validators";
import {
  ReportDocument,
  childMeta,
  synthesisCards,
} from "@/routes/_authenticated/report/report-document";
import { TOKO_LOGO_MARK, TOKO_LOGO_WORDMARK } from "@/components/shared/toko-logo";
import { cssString, reportPrintCss, reportPrintPageName } from "../report-print";

type Props = ComponentProps<typeof ReportDocument>;

const child = { id: "c1", name: "Pilote Fictif", gender: "male", ageRange: "6-8" } as unknown as Child;

const step = (n: number, completedAt: string | null) =>
  ({ id: `s${n}`, stepNumber: n, completedAt }) as unknown as BarkleyStep;

const med = (id: string, active: boolean) =>
  ({ id, name: "Traitement fictif", dose: "10 mg", schedule: "morning", startDate: "2026-09-01", active }) as unknown as Medication;

const crisis = { id: "k1", label: "Respirer", emoji: "\u{1F32C}\uFE0F", position: 0 } as unknown as CrisisItem;

function props(overrides: Partial<Props> = {}): Props {
  return {
    childId: "c1",
    child,
    isActive: true,
    parentName: "Parent Fictif",
    periodStart: new Date("2026-10-01T12:00:00Z"),
    periodEnd: new Date("2026-10-30T12:00:00Z"),
    now: new Date("2026-10-30T12:00:00Z"),
    questions: "",
    trackedDays: 21,
    symptomSummaries: [
      {
        key: "agitation",
        label: "Agitation",
        average: 6.1,
        trend: { arrow: "↓", word: "Amélioration", delta: "−2,1", tone: "better" },
        samples: 21,
      },
      { key: "sleep", label: "Sommeil", average: 6, trend: null, samples: 3 },
    ],
    journalEntries: [{ id: "j1", date: "2026-10-20", text: "Journée calme.", tags: ["crisis"] }],
    barkleySteps: [step(1, "2026-10-09"), step(2, null)],
    crisisItems: [crisis],
    medications: [med("m1", true), med("m2", false)],
    ...overrides,
  };
}

const render = (p: Props) => renderToStaticMarkup(createElement(ReportDocument, p));

describe("ReportDocument", () => {
  it("reprend la hiérarchie du PDF", () => {
    const html = render(props());
    const headings = [...html.matchAll(/<h[23][^>]*>(?:<span[^>]*><\/span>)?([^<]+)<\/h[23]>/g)].map((m) => m[1]);
    expect(headings).toEqual([
      "Pilote Fictif",
      "Synthèse de la période",
      "Moyennes par dimension",
      "Traitements",
      "Moments marquants du journal",
      "Programme Barkley",
      "Liste de crise",
    ]);
    expect(html.indexOf("Rapport de suivi TDAH")).toBeLessThan(html.indexOf("Pilote Fictif"));
    expect(html.lastIndexOf("Ce n&#x27;est pas un diagnostic médical.")).toBeGreaterThan(html.indexOf("Liste de crise"));
    expect(html).toContain("Données saisies par");
    expect(html).toContain("Parent Fictif");
  });

  it("double la couleur de tendance d'une flèche et d'un mot", () => {
    const html = render(props());
    expect(html).toContain("Plus bas = mieux");
    expect(html).toContain("Plus haut = mieux");
    expect(html).toMatch(/text-success-foreground[^>]*><span aria-hidden="true">↓ <\/span>Amélioration/);
    expect(html).toContain("−2,1 points");
    expect(html).toContain("Trop peu de relevés");
  });

  it("cache les pictogrammes aux lecteurs d'écran", () => {
    const html = render(props());
    const svgs = html.match(/<svg[^>]*>/g) ?? [];
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) expect(svg).toMatch(/aria-hidden="true"|aria-label="Tokō"/);
  });

  it("affiche un encadré quand une section est vide", () => {
    const html = render(
      props({
        symptomSummaries: [{ key: "mood", label: "Humeur", average: null, trend: null, samples: 0 }],
        journalEntries: [],
        barkleySteps: [],
        crisisItems: [],
        medications: [],
      }),
    );
    for (const text of [
      "Aucun relevé de symptômes sur cette période.",
      "Aucun traitement renseigné.",
      "Aucune entrée de journal sur cette période.",
      "Programme pas encore commencé.",
      "Aucune stratégie de régulation enregistrée.",
    ]) {
      expect(html).toContain(text);
    }
  });

  it("n'affiche les questions que si le parent en a saisi", () => {
    expect(render(props())).not.toContain("Questions du parent");
    expect(render(props({ questions: "  Faut-il ajuster ?  " }))).toContain("Faut-il ajuster ?");
  });

  it("limite le journal aux 10 entrées les plus récentes", () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({ id: `j${i}`, date: "2026-10-01", text: `Entrée ${i}` }));
    const html = render(props({ journalEntries: entries }));
    expect(html).toContain("Les 10 entrées les plus récentes sur 12.");
    expect(html).not.toContain("Entrée 11");
  });
});

describe("synthesisCards", () => {
  it("garde les pastels à sens fixe du PDF", () => {
    const cards = synthesisCards({
      trackedDays: 21,
      journalEntries: [
        { id: "a", date: "2026-10-01", tags: ["crisis"] },
        { id: "b", date: "2026-10-02", tags: ["victory"] },
      ],
      barkleySteps: [step(1, "2026-10-09"), step(2, null)],
      medications: [med("m1", true), med("m2", false)],
    });
    expect(cards).toEqual([
      { value: "21", label: "Jours suivis", surface: "mint" },
      { value: "1", label: "Crises notées", surface: "peach" },
      { value: "1/10", label: "Étapes Barkley", surface: "lavender" },
      { value: "2", label: "Entrées du journal", surface: "neutral" },
      { value: "1", label: "Traitements en cours", surface: "neutral" },
    ]);
  });

  it("écrit l'âge comme le PDF", () => {
    expect(childMeta(child)).toBe("Garçon · 6 à 8 ans");
  });
});

describe("impression", () => {
  it("échappe les valeurs placées dans le CSS de page", () => {
    expect(cssString('A "b" \\ </style>\nc')).toBe('"A \\"b\\" \\\\ \\3C /style> c"');
    expect(reportPrintPageName("ab-12;}x")).toBe("report-ab-12x");
  });

  it("numérote les pages et masque l'en-tête courant en page 1", () => {
    const css = reportPrintCss({ pageName: "report-c1", childName: "Pilote", period: "1 – 30 octobre" });
    expect(css).toContain('counter(page) " sur " counter(pages)');
    expect(css).toContain("Ce n'est pas un diagnostic médical.");
    expect(css).toMatch(/@page report-c1:first \{\s+@top-left \{ content: none; \}/);
  });
});

describe("logo", () => {
  it("reprend les tracés de brand/toko-logo.svg", () => {
    const svg = readFileSync(resolve(__dirname, "../../../../../brand/toko-logo.svg"), "utf-8");
    expect(svg).toContain(`transform="${TOKO_LOGO_MARK.transform}" d="${TOKO_LOGO_MARK.d}"`);
    expect(svg).toContain(`transform="${TOKO_LOGO_WORDMARK.transform}" d="${TOKO_LOGO_WORDMARK.d}"`);
  });
});
