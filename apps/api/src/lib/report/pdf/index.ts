import PDFDocument from "pdfkit";
import type { ReportData } from "../types";
import { PDF_PAGE_MARGIN, type PDFDoc } from "./theme";
import {
  renderBarkley,
  renderCrisisList,
  renderFooterOnEachPage,
  renderHeader,
  renderJournalHighlights,
  renderMedications,
  renderQuestionsBox,
  renderSymptomTable,
  renderSynthesis,
} from "./sections";

/**
 * A block of the printed report. Adding one — "Rendez-vous à venir", say —
 * means writing a renderer and appending an entry below; `buildReportPdf`
 * itself never changes.
 */
export interface ReportPdfSection {
  id: string;
  render: (doc: PDFDoc, data: ReportData) => void;
}

/** Flow sections, drawn top to bottom in this order. */
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

export function buildReportPdf(
  data: ReportData,
  sections: ReportPdfSection[] = REPORT_PDF_SECTIONS,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PDF_PAGE_MARGIN,
      // Keep every page in memory until `end()`. Without this PDFKit
      // flushes each page as soon as the next one starts, so
      // `bufferedPageRange()` only ever covers the LAST page — the
      // footer (and its "Page x/y" counter) then landed on that page
      // alone, numbered "1/1", on any report longer than one page.
      bufferPages: true,
      info: {
        Title: `Rapport TDAH — ${data.child.name}`,
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

    for (const section of sections) {
      section.render(doc, data);
    }

    // Not a flow section: it overlays every page that the sections above
    // produced, so it must run once they are all laid out.
    renderFooterOnEachPage(doc, data);

    doc.end();
  });
}
