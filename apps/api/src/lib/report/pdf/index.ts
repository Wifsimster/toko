import PDFDocument from "pdfkit";
import type { ReportData } from "../types";
import { PDF_MARGIN, pdfSafeText, registerBrandFonts, type PDFDoc } from "./theme";
import {
  renderBarkley,
  renderCrisisList,
  renderHeader,
  renderJournalHighlights,
  renderMedications,
  renderPageFurniture,
  renderQuestionsBox,
  renderSymptomTable,
  renderSynthesis,
} from "./sections";

export interface ReportPdfSection {
  id: string;
  render: (doc: PDFDoc, data: ReportData) => void;
}

export const REPORT_PDF_SECTIONS: ReportPdfSection[] = [
  { id: "header", render: renderHeader },
  {
    id: "questions",
    render: (doc, data) => {
      const questions = data.questions?.trim();
      if (questions) renderQuestionsBox(doc, questions);
    },
  },
  { id: "synthesis", render: renderSynthesis },
  { id: "symptom-table", render: renderSymptomTable },
  { id: "medications", render: renderMedications },
  { id: "journal", render: renderJournalHighlights },
  { id: "barkley", render: renderBarkley },
  { id: "crisis-list", render: renderCrisisList },
];

export function pdfSafeReportData(data: ReportData): ReportData {
  const safeOrNull = (value: string | null) => (value === null ? null : pdfSafeText(value));
  return {
    ...data,
    child: { ...data.child, name: pdfSafeText(data.child.name) || "Enfant" },
    journal: data.journal.map((e) => ({ ...e, text: safeOrNull(e.text) })),
    crisisItems: data.crisisItems.map((c) => ({ ...c, label: pdfSafeText(c.label) })),
    medications: data.medications.map((m) => ({
      ...m,
      name: pdfSafeText(m.name),
      dose: safeOrNull(m.dose),
      notes: safeOrNull(m.notes),
    })),
    questions: data.questions === undefined ? undefined : pdfSafeText(data.questions),
    parentName: pdfSafeText(data.parentName) || "le parent",
  };
}

export function buildReportPdf(
  input: ReportData,
  sections: ReportPdfSection[] = REPORT_PDF_SECTIONS,
): Promise<Buffer> {
  const data = pdfSafeReportData(input);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { ...PDF_MARGIN },
      bufferPages: true,
      lang: "fr-FR",
      displayTitle: true,
      info: {
        Title: `Rapport de suivi TDAH — ${data.child.name}`,
        Author: data.parentName,
        Creator: "Tokō",
        Producer: "Tokō",
        Subject: `Période ${data.sinceDate} → ${data.untilDate}`,
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    registerBrandFonts(doc);

    for (const section of sections) {
      section.render(doc, data);
    }

    renderPageFurniture(doc, data);

    doc.end();
  });
}
