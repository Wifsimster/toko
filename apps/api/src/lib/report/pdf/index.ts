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

export function buildReportPdf(
  data: ReportData,
  sections: ReportPdfSection[] = REPORT_PDF_SECTIONS,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PDF_PAGE_MARGIN,
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

    renderFooterOnEachPage(doc, data);

    doc.end();
  });
}
