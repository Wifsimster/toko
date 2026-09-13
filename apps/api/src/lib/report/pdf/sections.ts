import { dimensionTrend, trendDisplay } from "../../report-trend";
import { formatFrDate } from "../../format/date-fr";
import {
    avg,
    countCrisisEntries,
    dimensionValues,
    SCHEDULE_LABELS,
    SYMPTOM_DIMENSIONS,
    SYMPTOM_LABELS,
    type ReportData,
    type ReportMedication,
} from "../types";
import {
    pageWidth,
    sectionTitle,
    PDF_BORDER,
    PDF_BRAND,
    PDF_MUTED,
    PDF_PAGE_MARGIN,
    PDF_TEXT,
    type PDFDoc,
} from "./theme";

/**
 * One function per block of the PDF. Each takes only the slice of
 * `ReportData` it draws — `renderCrisisList` cannot accidentally start
 * depending on medications — and each returns early when its slice is
 * empty, so the section order in `index.ts` stays declarative.
 */

export function renderHeader(doc: PDFDoc, data: Pick<ReportData, "child" | "sinceDate" | "untilDate">): void {
    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(PDF_BRAND)
        .text("RAPPORT TDAH · TOKO", { characterSpacing: 1 });

    doc.moveDown(0.3);
    doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(PDF_TEXT)
        .text(data.child.name);

    const meta: string[] = [];
    if (data.child.gender) {
        meta.push(
            data.child.gender === "male"
                ? "Garçon"
                : data.child.gender === "female"
                    ? "Fille"
                    : data.child.gender,
        );
    }
    if (data.child.ageRange) meta.push(data.child.ageRange);

    doc.moveDown(0.2);
    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(PDF_MUTED)
        .text(
            `Période : ${formatFrDate(data.sinceDate)} — ${formatFrDate(data.untilDate)} · Généré le ${formatFrDate(new Date().toISOString())}`,
        );
    if (meta.length > 0) {
        doc.text(meta.join(" · "));
    }

    doc.moveDown(0.4);
    const y = doc.y;
    doc
        .strokeColor(PDF_BRAND)
        .lineWidth(1.5)
        .moveTo(PDF_PAGE_MARGIN, y)
        .lineTo(PDF_PAGE_MARGIN + pageWidth(doc), y)
        .stroke();
    doc.moveDown(0.5);
}

export function renderQuestionsBox(doc: PDFDoc, questions: string): void {
    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const padding = 10;

    // Pre-measure height so we can draw a background that fits the text.
    doc.font("Helvetica").fontSize(10).fillColor(PDF_TEXT);
    const textHeight = doc.heightOfString(questions, { width: w - padding * 2 });
    const titleHeight = 14;
    const totalHeight = textHeight + titleHeight + padding * 2;

    const y = doc.y;
    doc
        .save()
        .roundedRect(x, y, w, totalHeight, 6)
        .fillColor("#eff6ff")
        .fill()
        .restore();
    doc
        .save()
        .roundedRect(x, y, w, totalHeight, 6)
        .strokeColor("#bfdbfe")
        .lineWidth(1)
        .stroke()
        .restore();

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#2563eb")
        .text("QUESTIONS DU PARENT", x + padding, y + padding, {
            characterSpacing: 0.5,
        });
    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(PDF_TEXT)
        .text(questions, x + padding, y + padding + titleHeight, {
            width: w - padding * 2,
        });

    doc.y = y + totalHeight;
    doc.x = x;
    doc.moveDown(0.5);
}

export function renderSynthesis(doc: PDFDoc, data: Pick<ReportData, "journal" | "symptoms" | "medications">): void {
    sectionTitle(doc, "Synthèse de la période");

    const crisisCount = countCrisisEntries(data.journal);
    const activeMedsCount = data.medications.filter((m) => m.active).length;

    const cards = [
        { value: String(data.journal.length), label: "Entrées journal" },
        { value: String(data.symptoms.length), label: "Jours suivis" },
        { value: String(crisisCount), label: "Crises notées" },
        { value: String(activeMedsCount), label: "Traitements actifs" },
    ];

    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const gap = 8;
    const cardW = (w - gap * (cards.length - 1)) / cards.length;
    const cardH = 50;
    const y = doc.y;

    cards.forEach((card, i) => {
        const cx = x + i * (cardW + gap);
        doc
            .save()
            .roundedRect(cx, y, cardW, cardH, 6)
            .strokeColor(PDF_BORDER)
            .lineWidth(1)
            .stroke()
            .restore();
        doc
            .font("Helvetica-Bold")
            .fontSize(18)
            .fillColor(PDF_TEXT)
            .text(card.value, cx, y + 8, { width: cardW, align: "center" });
        doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(PDF_MUTED)
            .text(card.label, cx, y + 30, { width: cardW, align: "center" });
    });

    doc.y = y + cardH;
    doc.x = x;
    doc.moveDown(0.5);
}

export function renderSymptomTable(doc: PDFDoc, data: Pick<ReportData, "symptoms">): void {
    sectionTitle(doc, "Moyennes par dimension (échelle 0-10)");

    const dims = SYMPTOM_DIMENSIONS;
    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const colDimW = w * 0.32;
    const colAvgW = w * 0.16;
    const colTrendW = w * 0.34;
    const colCountW = w * 0.18;
    const rowH = 22;

    let y = doc.y;
    doc
        .save()
        .rect(x, y, w, rowH)
        .fillColor("#f9fafb")
        .fill()
        .restore();
    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(PDF_MUTED)
        .text("Dimension", x + 10, y + 7, { width: colDimW - 10 });
    doc.text("Moyenne", x + colDimW, y + 7, {
        width: colAvgW,
        align: "center",
    });
    doc.text("Tendance", x + colDimW + colAvgW, y + 7, {
        width: colTrendW,
        align: "center",
    });
    doc.text("Relevés", x + colDimW + colAvgW + colTrendW, y + 7, {
        width: colCountW,
        align: "center",
    });
    y += rowH;

    dims.forEach((key) => {
        const values = dimensionValues(data.symptoms, key);
        const trend = trendDisplay(dimensionTrend(data.symptoms, key));
        doc
            .strokeColor(PDF_BORDER)
            .lineWidth(0.5)
            .moveTo(x, y)
            .lineTo(x + w, y)
            .stroke();

        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(SYMPTOM_LABELS[key] ?? key, x + 10, y + 7, {
                width: colDimW - 10,
            });
        doc.text(avg(values), x + colDimW, y + 7, {
            width: colAvgW,
            align: "center",
        });
        doc
            .fillColor(trend.color)
            .fontSize(9)
            .text(trend.label, x + colDimW + colAvgW, y + 7.5, {
                width: colTrendW,
                align: "center",
            });
        doc
            .fillColor(PDF_TEXT)
            .fontSize(10)
            .text(String(values.length), x + colDimW + colAvgW + colTrendW, y + 7, {
                width: colCountW,
                align: "center",
            });
        y += rowH;
    });

    doc
        .strokeColor(PDF_BORDER)
        .lineWidth(0.5)
        .moveTo(x, y)
        .lineTo(x + w, y)
        .stroke();

    doc.y = y;
    doc.x = x;
    doc.moveDown(0.3);
    doc
        .font("Helvetica-Oblique")
        .fontSize(7.5)
        .fillColor(PDF_MUTED)
        .text(
            "Tendance : évolution de la 2e moitié de la période par rapport à la 1re (vert = amélioration, rouge = aggravation).",
            x,
            doc.y,
            { width: w },
        );
    doc.fillColor(PDF_TEXT);
    doc.moveDown(0.5);
}

export function renderMedications(doc: PDFDoc, data: Pick<ReportData, "medications">): void {
    if (data.medications.length === 0) return;
    sectionTitle(doc, "Traitements médicamenteux");

    const active = data.medications.filter((m) => m.active);
    const inactive = data.medications.filter((m) => !m.active);

    const renderGroup = (
        label: string,
        meds: ReportMedication[],
        labelColor: string,
    ) => {
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(labelColor)
            .text(`${label} · ${meds.length}`);
        doc.moveDown(0.2);

        meds.forEach((m) => {
            const period = m.endDate
                ? `${formatFrDate(m.startDate)} — ${formatFrDate(m.endDate)}`
                : `Depuis le ${formatFrDate(m.startDate)}`;
            const adherence =
                m.adherence && m.adherence.total > 0
                    ? `  ·  Observance ${Math.round(
                          (m.adherence.taken / m.adherence.total) * 100,
                      )}% (${m.adherence.taken}/${m.adherence.total})`
                    : "";

            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor(PDF_TEXT)
                .text(m.dose ? `${m.name} — ${m.dose}` : m.name, {
                    continued: false,
                });
            doc
                .font("Helvetica")
                .fontSize(9)
                .fillColor(PDF_MUTED)
                .text(
                    `${SCHEDULE_LABELS[m.schedule] ?? m.schedule} · ${period}${adherence}`,
                );
            if (m.notes) {
                doc
                    .font("Helvetica-Oblique")
                    .fontSize(9)
                    .fillColor("#4b5563")
                    .text(m.notes);
            }
            doc.moveDown(0.3);
        });
    };

    if (active.length > 0) renderGroup("EN COURS", active, "#059669");
    if (inactive.length > 0) {
        if (active.length > 0) doc.moveDown(0.2);
        renderGroup("HISTORIQUE", inactive, PDF_MUTED);
    }
    doc.moveDown(0.3);
}

export function renderJournalHighlights(doc: PDFDoc, data: Pick<ReportData, "journal">): void {
    if (data.journal.length === 0) return;
    sectionTitle(doc, "Moments marquants du journal");

    const recent = [...data.journal]
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        .slice(0, 10);

    recent.forEach((entry) => {
        doc
            .font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(PDF_MUTED)
            .text(formatFrDate(entry.date));
        if (entry.text) {
            doc
                .font("Helvetica")
                .fontSize(10)
                .fillColor(PDF_TEXT)
                .text(entry.text);
        }
        doc.moveDown(0.3);
    });
}

export function renderBarkley(doc: PDFDoc, data: Pick<ReportData, "barkleySteps">): void {
    const completed = data.barkleySteps
        .filter((s) => s.completedAt)
        .sort((a, b) => a.stepNumber - b.stepNumber);
    if (completed.length === 0) return;

    sectionTitle(doc, "Programme Barkley");

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(PDF_TEXT)
        .text(`${completed.length} / 10 étapes complétées`);
    doc.moveDown(0.3);

    // Progress bar
    const x = PDF_PAGE_MARGIN;
    const w = pageWidth(doc);
    const barH = 6;
    const y = doc.y;
    doc
        .save()
        .roundedRect(x, y, w, barH, 3)
        .fillColor("#f3f4f6")
        .fill()
        .restore();
    doc
        .save()
        .roundedRect(x, y, (w * completed.length) / 10, barH, 3)
        .fillColor(PDF_BRAND)
        .fill()
        .restore();
    doc.y = y + barH + 6;
    doc.x = x;

    completed.forEach((s) => {
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(
                `• Étape ${s.stepNumber}${s.completedAt ? ` — ${formatFrDate(s.completedAt)}` : ""}`,
            );
    });
    doc.moveDown(0.3);
}

export function renderCrisisList(doc: PDFDoc, data: Pick<ReportData, "crisisItems">): void {
    if (data.crisisItems.length === 0) return;
    sectionTitle(doc, "Liste de crise");

    doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(PDF_MUTED)
        .text(
            `${data.crisisItems.length} stratégie${data.crisisItems.length > 1 ? "s" : ""} de régulation`,
        );
    doc.moveDown(0.2);

    data.crisisItems.forEach((item, i) => {
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor(PDF_TEXT)
            .text(`${i + 1}. ${item.label}`);
    });
    doc.moveDown(0.3);
}

export function renderFooterOnEachPage(doc: PDFDoc, data: Pick<ReportData, "parentName">): void {
    const range = doc.bufferedPageRange();
    // Snapshot the count before the loop: the footer sits *inside* the bottom
    // margin, so each page must have that margin zeroed while we draw or
    // PDFKit treats the write as an overflow and appends a blank page —
    // which would also grow `range` as we iterate.
    const pageCount = range.count;
    for (let i = range.start; i < range.start + pageCount; i++) {
        doc.switchToPage(i);
        const bottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        const y = doc.page.height - PDF_PAGE_MARGIN + 10;
        const w = pageWidth(doc);
        doc
            .strokeColor(PDF_BORDER)
            .lineWidth(0.5)
            .moveTo(PDF_PAGE_MARGIN, y)
            .lineTo(PDF_PAGE_MARGIN + w, y)
            .stroke();
        doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor(PDF_MUTED)
            .text(
                `Toko · toko.app — Rapport généré pour ${data.parentName} · Page ${i - range.start + 1}/${pageCount}`,
                PDF_PAGE_MARGIN,
                y + 6,
                { width: w, align: "center", lineBreak: false },
            );
        doc
            .fontSize(7)
            .fillColor("#9ca3af")
            .text(
                "Ce rapport est généré à partir des données saisies par le parent. Il ne constitue pas un diagnostic médical.",
                PDF_PAGE_MARGIN,
                y + 18,
                { width: w, align: "center", lineBreak: false },
            );
        doc.page.margins.bottom = bottomMargin;
    }
}
