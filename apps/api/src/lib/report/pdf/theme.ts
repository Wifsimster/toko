import type PDFDocument from "pdfkit";

export type PDFDoc = InstanceType<typeof PDFDocument>;

export const PDF_PAGE_MARGIN = 50;
export const PDF_BRAND = "#6366f1";
export const PDF_TEXT = "#1f2937";
export const PDF_MUTED = "#6b7280";
export const PDF_BORDER = "#e5e7eb";

export function pageWidth(doc: PDFDoc): number {
    return doc.page.width - PDF_PAGE_MARGIN * 2;
}

export function sectionTitle(doc: PDFDoc, title: string): void {
    doc.moveDown(0.6);
    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(PDF_MUTED)
        .text(title.toUpperCase(), { characterSpacing: 0.5 });
    doc.moveDown(0.3);
}
