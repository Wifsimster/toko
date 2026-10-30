import { drawCrisisIcon } from "../crisis-icon";
import { dimensionTrend, HIGHER_IS_BETTER, type DimensionTrend } from "../../report-trend";
import { formatFrDate } from "../../format/date-fr";
import {
    countCrisisEntries,
    countTrackedDays,
    dimensionValues,
    SCHEDULE_LABELS,
    SYMPTOM_DIMENSIONS,
    SYMPTOM_LABELS,
    type ReportData,
    type ReportMedication,
} from "../types";
import { drawLogo, drawMark, logoWidthForHeight, markWidthForHeight } from "./brand";
import {
    emptyState,
    ensureSpace,
    fitText,
    formatScore,
    formatSigned,
    pageBottom,
    pageWidth,
    sectionTitle,
    PDF_BORDER,
    PDF_BRAND,
    PDF_BRAND_STRONG,
    PDF_CREAM,
    PDF_DANGER_TEXT,
    PDF_FONT,
    PDF_INK,
    PDF_MARGIN,
    PDF_MUTED,
    PDF_RULE,
    PDF_SUCCESS_TEXT,
    PDF_SURFACE,
    type PdfSurface,
    type PDFDoc,
} from "./theme";

const GENDER_LABELS: Record<string, string> = { male: "Garçon", female: "Fille" };

export function childMeta(child: ReportData["child"]): string {
    const meta: string[] = [];
    const gender = child.gender ? GENDER_LABELS[child.gender] : undefined;
    if (gender) meta.push(gender);
    if (child.ageRange) meta.push(`${child.ageRange.replace("-", " à ")} ans`);
    return meta.join(" · ");
}

export function periodLabel(sinceDate: string, untilDate: string): string {
    return `${formatFrDate(sinceDate)} – ${formatFrDate(untilDate)}`;
}

function ensureSpaceOrContinue(doc: PDFDoc, height: number, title: string): void {
    const pages = doc.bufferedPageRange().count;
    ensureSpace(doc, height);
    if (doc.bufferedPageRange().count > pages) {
        kicker(doc, `${title} (suite)`, PDF_MARGIN.left, doc.y);
        doc.y += 16;
    }
}

function kicker(doc: PDFDoc, text: string, x: number, y: number, options: PDFKit.Mixins.TextOptions = {}): void {
    doc
        .font(PDF_FONT.semibold)
        .fontSize(7.5)
        .fillColor(PDF_MUTED)
        .text(text.toUpperCase(), x, y, { characterSpacing: 0.6, lineBreak: false, ...options });
}

export function renderHeader(
    doc: PDFDoc,
    data: Pick<ReportData, "child" | "sinceDate" | "untilDate" | "parentName">,
): void {
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const pad = 22;
    const innerW = w - pad * 2;
    const top = 36;

    doc.font(PDF_FONT.extrabold).fontSize(24);
    const nameH = doc.heightOfString(data.child.name, { width: innerW, characterSpacing: -0.4, lineGap: -2 });
    const meta = childMeta(data.child);

    const columns = [
        { label: "Période", value: `Du ${formatFrDate(data.sinceDate)}\nau ${formatFrDate(data.untilDate)}` },
        { label: "Données saisies par", value: data.parentName },
        { label: "Généré le", value: formatFrDate(new Date()) },
    ];
    const colGap = 16;
    const colW = (innerW - colGap * (columns.length - 1)) / columns.length;
    doc.font(PDF_FONT.semibold).fontSize(10);
    const valuesH = Math.max(...columns.map((c) => doc.heightOfString(c.value, { width: colW })));

    const logoH = 18;
    const bandH = pad + logoH + 18 + 13 + 12 + nameH + 2 + (meta ? 16 : 0) + 16 + 12 + valuesH + pad;
    doc.save().roundedRect(x, top, w, bandH, 14).fill(PDF_CREAM).restore();
    doc.save().roundedRect(x, top, w, bandH, 14).lineWidth(0.75).stroke(PDF_BORDER).restore();

    let y = top + pad;
    drawLogo(doc, x + pad, y, logoH);
    doc
        .font(PDF_FONT.semibold)
        .fontSize(8.5)
        .fillColor(PDF_BRAND_STRONG)
        .text("RAPPORT DE SUIVI TDAH", x + pad, y + 5, { width: innerW, align: "right", characterSpacing: 0.8, lineBreak: false });
    y += logoH + 18;

    doc.save().moveTo(x + pad, y).lineTo(x + pad + innerW, y).lineWidth(0.75).stroke(PDF_BORDER).restore();
    y += 13;

    kicker(doc, "Enfant", x + pad, y - 1);
    y += 12;
    doc
        .font(PDF_FONT.extrabold)
        .fontSize(24)
        .fillColor(PDF_INK)
        .text(data.child.name, x + pad, y, { width: innerW, characterSpacing: -0.4, lineGap: -2 });
    y += nameH + 2;
    if (meta) {
        doc.font(PDF_FONT.regular).fontSize(10.5).fillColor(PDF_MUTED).text(meta, x + pad, y + 2, { width: innerW });
        y += 16;
    }
    y += 16;

    columns.forEach((col, i) => {
        const cx = x + pad + i * (colW + colGap);
        if (i > 0) {
            doc.save().moveTo(cx - colGap / 2, y).lineTo(cx - colGap / 2, y + 12 + valuesH).lineWidth(0.75).stroke(PDF_BORDER).restore();
        }
        kicker(doc, col.label, cx, y, { width: colW });
        doc.font(PDF_FONT.semibold).fontSize(10).fillColor(PDF_INK).text(col.value, cx, y + 12, { width: colW });
    });

    doc.x = x;
    doc.y = top + bandH + 4;
}

export function renderQuestionsBox(doc: PDFDoc, questions: string): void {
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const pad = 14;
    const titleH = 16;
    doc.y += 14;

    doc.font(PDF_FONT.regular).fontSize(10.5);
    const textH = doc.heightOfString(questions, { width: w - pad * 2 - 4, lineGap: 1.5 });
    const boxH = textH + titleH + pad * 2;
    ensureSpace(doc, Math.min(boxH, 110));
    const fits = doc.y + boxH <= pageBottom(doc);
    const y = doc.y;

    if (fits) {
        doc.save().roundedRect(x, y, w, boxH, 10).lineWidth(0.9).stroke(PDF_RULE).restore();
        doc.save().roundedRect(x, y + 10, 3, boxH - 20, 1.5).fill(PDF_BRAND).restore();
    }
    doc
        .font(PDF_FONT.semibold)
        .fontSize(9)
        .fillColor(PDF_BRAND_STRONG)
        .text("Questions du parent pour la consultation", x + pad + 4, y + pad, { width: w - pad * 2 - 4, lineBreak: false });
    doc
        .font(PDF_FONT.regular)
        .fontSize(10.5)
        .fillColor(PDF_INK)
        .text(questions, x + pad + 4, y + pad + titleH, { width: w - pad * 2 - 4, lineGap: 1.5 });

    doc.x = x;
    doc.y = fits ? y + boxH : doc.y + 6;
}

export interface SynthesisCard {
    value: string;
    label: string;
    surface: PdfSurface;
}

export function synthesisCards(data: Pick<ReportData, "journal" | "symptoms" | "medications" | "barkleySteps">): SynthesisCard[] {
    const barkleyDone = data.barkleySteps.filter((s) => s.completedAt).length;
    return [
        { value: String(countTrackedDays(data.symptoms)), label: "Jours suivis", surface: "mint" },
        { value: String(countCrisisEntries(data.journal)), label: "Crises notées", surface: "peach" },
        { value: `${barkleyDone}/10`, label: "Étapes Barkley", surface: "lavender" },
        { value: String(data.journal.length), label: "Entrées du journal", surface: "neutral" },
        { value: String(data.medications.filter((m) => m.active).length), label: "Traitements en cours", surface: "neutral" },
    ];
}

export function renderSynthesis(
    doc: PDFDoc,
    data: Pick<ReportData, "journal" | "symptoms" | "medications" | "barkleySteps">,
): void {
    const cards = synthesisCards(data);
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const gap = 8;
    const cardW = (w - gap * (cards.length - 1)) / cards.length;
    const pad = 10;

    doc.font(PDF_FONT.semibold).fontSize(8.5);
    const labelH = Math.max(...cards.map((c) => doc.heightOfString(c.label, { width: cardW - pad * 2 })));
    const cardH = pad + 26 + labelH + pad;

    sectionTitle(doc, "Synthèse de la période", cardH);
    const y = doc.y;

    cards.forEach((card, i) => {
        const cx = x + i * (cardW + gap);
        doc.save().roundedRect(cx, y, cardW, cardH, 10).fill(PDF_SURFACE[card.surface]).restore();
        doc
            .font(PDF_FONT.extrabold)
            .fontSize(20)
            .fillColor(PDF_INK)
            .text(card.value, cx + pad, y + pad - 1, { width: cardW - pad * 2, lineBreak: false, characterSpacing: -0.3 });
        doc
            .font(PDF_FONT.semibold)
            .fontSize(8.5)
            .fillColor(PDF_MUTED)
            .text(card.label, cx + pad, y + pad + 26, { width: cardW - pad * 2 });
    });

    doc.x = x;
    doc.y = y + cardH;
}

export interface TrendView {
    arrow: string;
    delta: string;
    word: string;
    color: string;
}

export function trendView(trend: DimensionTrend | null): TrendView | null {
    if (!trend) return null;
    const delta = formatSigned(trend.delta);
    if (trend.better === null) return { arrow: "→", delta, word: "Stable", color: PDF_MUTED };
    const arrow = trend.delta > 0 ? "↑" : "↓";
    if (trend.better) return { arrow, delta, word: "Amélioration", color: PDF_SUCCESS_TEXT };
    return { arrow, delta, word: "Aggravation", color: PDF_DANGER_TEXT };
}

export function renderSymptomTable(doc: PDFDoc, data: Pick<ReportData, "symptoms">): void {
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const headerH = 22;
    const rowH = 36;
    const noteH = 30;

    if (data.symptoms.length === 0) {
        sectionTitle(doc, "Moyennes par dimension", 40);
        emptyState(doc, "Aucun relevé de symptômes sur cette période.");
        return;
    }

    sectionTitle(doc, "Moyennes par dimension", headerH + rowH * SYMPTOM_DIMENSIONS.length + noteH);

    const cols = { dim: w * 0.3, avg: w * 0.27, trend: w * 0.3, count: w * 0.13 };
    const cx = {
        dim: x + 10,
        avg: x + cols.dim,
        trend: x + cols.dim + cols.avg,
        count: x + cols.dim + cols.avg + cols.trend,
    };

    let y = doc.y;
    kicker(doc, "Dimension", cx.dim, y + 7);
    kicker(doc, "Moyenne sur 10", cx.avg, y + 7);
    kicker(doc, "Tendance", cx.trend, y + 7);
    kicker(doc, "Relevés", cx.count, y + 7, { width: cols.count - 10, align: "right" });
    y += headerH;
    doc.save().moveTo(x, y).lineTo(x + w, y).lineWidth(1).stroke(PDF_INK).restore();

    SYMPTOM_DIMENSIONS.forEach((key, index) => {
        const values = dimensionValues(data.symptoms, key);
        const view = trendView(dimensionTrend(data.symptoms, key));
        const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

        if (index > 0) {
            doc.save().moveTo(x, y).lineTo(x + w, y).lineWidth(0.6).stroke(PDF_BORDER).restore();
        }

        doc
            .font(PDF_FONT.semibold)
            .fontSize(10.5)
            .fillColor(PDF_INK)
            .text(SYMPTOM_LABELS[key], cx.dim, y + 6, { width: cols.dim - 14, lineBreak: false });
        doc
            .font(PDF_FONT.regular)
            .fontSize(8)
            .fillColor(PDF_MUTED)
            .text(HIGHER_IS_BETTER.has(key) ? "Plus haut = mieux" : "Plus bas = mieux", cx.dim, y + 20, {
                width: cols.dim - 14,
                lineBreak: false,
            });

        if (mean === null) {
            doc.font(PDF_FONT.regular).fontSize(10).fillColor(PDF_MUTED).text("Pas de relevé", cx.avg, y + 12, { lineBreak: false });
        } else {
            doc
                .font(PDF_FONT.extrabold)
                .fontSize(12)
                .fillColor(PDF_INK)
                .text(formatScore(mean), cx.avg, y + 10, { width: 30, lineBreak: false });
            const barX = cx.avg + 34;
            const barW = cols.avg - 50;
            const barY = y + 16;
            doc.save().roundedRect(barX, barY, barW, 5, 2.5).fill(PDF_BORDER).restore();
            if (mean > 0) {
                doc.save().roundedRect(barX, barY, Math.max(5, (barW * Math.min(mean, 10)) / 10), 5, 2.5).fill(PDF_BRAND).restore();
            }
        }

        if (view) {
            doc
                .font(PDF_FONT.semibold)
                .fontSize(10)
                .fillColor(view.color)
                .text(`${view.arrow} ${view.word}`, cx.trend, y + 6, { width: cols.trend - 8, lineBreak: false });
            doc
                .font(PDF_FONT.regular)
                .fontSize(8)
                .fillColor(PDF_MUTED)
                .text(`${view.delta} points`, cx.trend + 12, y + 20, { width: cols.trend - 20, lineBreak: false });
        } else {
            doc
                .font(PDF_FONT.regular)
                .fontSize(9)
                .fillColor(PDF_MUTED)
                .text("Trop peu de relevés", cx.trend, y + 12, { width: cols.trend - 8, lineBreak: false });
        }

        doc
            .font(PDF_FONT.semibold)
            .fontSize(10.5)
            .fillColor(PDF_INK)
            .text(String(values.length), cx.count, y + 12, { width: cols.count - 10, align: "right", lineBreak: false });

        y += rowH;
    });

    doc.save().moveTo(x, y).lineTo(x + w, y).lineWidth(1).stroke(PDF_INK).restore();
    doc
        .font(PDF_FONT.regular)
        .fontSize(8)
        .fillColor(PDF_MUTED)
        .text(
            "Tendance : écart entre la 2e et la 1re moitié de la période (4 relevés minimum). La flèche donne le sens de la variation, le mot dit si c'est mieux ou moins bien.",
            x,
            y + 7,
            { width: w, lineGap: 1 },
        );
    doc.x = x;
}

function medicationBlock(doc: PDFDoc, m: ReportMedication, x: number, w: number): void {
    const title = m.dose ? `${m.name} · ${m.dose}` : m.name;
    const period = m.endDate
        ? `${formatFrDate(m.startDate)} – ${formatFrDate(m.endDate)}`
        : `Depuis le ${formatFrDate(m.startDate)}`;
    const meta = [SCHEDULE_LABELS[m.schedule] ?? m.schedule, period];
    if (m.adherence && m.adherence.total > 0) {
        const pct = Math.round((m.adherence.taken / m.adherence.total) * 100);
        meta.push(`Observance ${pct} % (${m.adherence.taken}/${m.adherence.total})`);
    }
    const metaText = meta.join(" · ");
    const notes = m.notes ? `Note : ${m.notes}` : null;

    doc.font(PDF_FONT.semibold).fontSize(10.5);
    const titleH = doc.heightOfString(title, { width: w });
    doc.font(PDF_FONT.regular).fontSize(9);
    const metaH = doc.heightOfString(metaText, { width: w });
    const notesH = notes ? doc.heightOfString(notes, { width: w }) + 2 : 0;
    ensureSpace(doc, Math.min(titleH + metaH + notesH + 10, 120));

    doc.font(PDF_FONT.semibold).fontSize(10.5).fillColor(PDF_INK).text(title, x, doc.y, { width: w });
    doc.font(PDF_FONT.regular).fontSize(9).fillColor(PDF_MUTED).text(metaText, x, doc.y + 1, { width: w });
    if (notes) doc.fillColor(PDF_INK).text(notes, x, doc.y + 2, { width: w });
    doc.y += 8;
}

export function renderMedications(doc: PDFDoc, data: Pick<ReportData, "medications">): void {
    sectionTitle(doc, "Traitements");
    if (data.medications.length === 0) {
        emptyState(doc, "Aucun traitement renseigné.");
        return;
    }

    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const groups = [
        { label: "En cours", meds: data.medications.filter((m) => m.active) },
        { label: "Arrêtés", meds: data.medications.filter((m) => !m.active) },
    ].filter((g) => g.meds.length > 0);

    groups.forEach((group, i) => {
        if (i > 0) doc.y += 4;
        ensureSpace(doc, 50);
        kicker(doc, `${group.label} · ${group.meds.length}`, x, doc.y);
        doc.y += 13;
        group.meds.forEach((m) => medicationBlock(doc, m, x, w));
    });
    doc.x = x;
}

const JOURNAL_LINE_GAP = 1;

function wrapLines(doc: PDFDoc, text: string, width: number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
        let line = "";
        for (const word of paragraph.split(/ +/)) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && doc.widthOfString(candidate) > width) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        }
        lines.push(line);
    }
    return lines;
}

function journalText(doc: PDFDoc, text: string, x: number, w: number): void {
    doc.font(PDF_FONT.regular).fontSize(10).fillColor(PDF_INK);
    const lineH = doc.currentLineHeight(true) + JOURNAL_LINE_GAP;
    const lines = wrapLines(doc, text, w);
    let i = 0;
    while (i < lines.length) {
        const remaining = lines.length - i;
        const fits = Math.max(0, Math.floor((pageBottom(doc) - doc.y) / lineH));
        let take = Math.min(remaining, fits);
        if (take < remaining) {
            if (remaining - take === 1) take -= 1;
            if (i === 0 && take < 2) take = 0;
        }
        if (take < 1) {
            doc.addPage();
            doc.x = PDF_MARGIN.left;
            kicker(doc, "Moments marquants du journal (suite)", PDF_MARGIN.left, doc.y);
            doc.y += 16;
            doc.font(PDF_FONT.regular).fontSize(10).fillColor(PDF_INK);
            continue;
        }
        for (const line of lines.slice(i, i + take)) {
            const lineY = doc.y;
            doc.text(line, x, lineY, { width: w, lineBreak: false });
            doc.y = lineY + lineH;
        }
        i += take;
    }
}

export function renderJournalHighlights(doc: PDFDoc, data: Pick<ReportData, "journal">): void {
    sectionTitle(doc, "Moments marquants du journal");
    if (data.journal.length === 0) {
        emptyState(doc, "Aucune entrée de journal sur cette période.");
        return;
    }

    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const recent = [...data.journal]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    if (data.journal.length > recent.length) {
        doc
            .font(PDF_FONT.regular)
            .fontSize(8.5)
            .fillColor(PDF_MUTED)
            .text(`Les ${recent.length} entrées les plus récentes sur ${data.journal.length}.`, x, doc.y, { width: w });
        doc.y += 6;
    }

    recent.forEach((entry, i) => {
        const isCrisis = Array.isArray(entry.tags) && (entry.tags as string[]).includes("crisis");
        doc.font(PDF_FONT.regular).fontSize(10);
        ensureSpaceOrContinue(doc, 16 + doc.currentLineHeight(true) * 2, "Moments marquants du journal");
        if (i > 0) {
            doc.save().moveTo(x, doc.y).lineTo(x + w, doc.y).lineWidth(0.6).stroke(PDF_BORDER).restore();
            doc.y += 7;
        }
        const y = doc.y;
        const date = formatFrDate(entry.date);
        doc.font(PDF_FONT.semibold).fontSize(8.5).fillColor(PDF_BRAND_STRONG).text(date, x, y, { lineBreak: false });
        if (isCrisis) {
            const tagX = x + doc.widthOfString(date) + 8;
            doc.font(PDF_FONT.semibold).fontSize(7.5);
            const tagW = doc.widthOfString("Crise") + 10;
            doc.save().roundedRect(tagX, y - 1.5, tagW, 12, 6).fill(PDF_SURFACE.peach).restore();
            doc.fillColor(PDF_INK).text("Crise", tagX + 5, y + 0.5, { lineBreak: false });
        }
        doc.y = y + 13;
        if (entry.text) journalText(doc, entry.text, x, w);
        doc.y += 7;
    });
    doc.x = x;
}

export function renderBarkley(doc: PDFDoc, data: Pick<ReportData, "barkleySteps">): void {
    const completed = data.barkleySteps
        .filter((s) => s.completedAt)
        .sort((a, b) => a.stepNumber - b.stepNumber);

    sectionTitle(doc, "Programme Barkley", 70);
    if (completed.length === 0) {
        emptyState(doc, "Programme pas encore commencé.");
        return;
    }

    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const done = new Set(completed.map((s) => s.stepNumber));

    doc
        .font(PDF_FONT.semibold)
        .fontSize(10.5)
        .fillColor(PDF_INK)
        .text(`${done.size} étape${done.size > 1 ? "s" : ""} terminée${done.size > 1 ? "s" : ""} sur 10`, x, doc.y, { width: w });
    doc.y += 6;

    const gap = 4;
    const segW = (w - gap * 9) / 10;
    const segH = 10;
    const y = doc.y;
    for (let n = 1; n <= 10; n++) {
        const sx = x + (n - 1) * (segW + gap);
        if (done.has(n)) {
            doc.save().roundedRect(sx, y, segW, segH, 3).fill(PDF_BRAND).restore();
        } else {
            doc.save().roundedRect(sx + 0.5, y + 0.5, segW - 1, segH - 1, 3).lineWidth(0.8).stroke(PDF_MUTED).restore();
        }
        doc
            .font(done.has(n) ? PDF_FONT.semibold : PDF_FONT.regular)
            .fontSize(7.5)
            .fillColor(done.has(n) ? PDF_INK : PDF_MUTED)
            .text(String(n), sx, y + segH + 3, { width: segW, align: "center", lineBreak: false });
    }
    doc.y = y + segH + 18;

    const colCount = 2;
    const colW = w / colCount;
    const lineH = 15;
    const rows = Math.ceil(completed.length / colCount);
    ensureSpace(doc, rows * lineH);
    const listY = doc.y;
    completed.forEach((s, i) => {
        const col = Math.floor(i / rows);
        const row = i % rows;
        const lx = x + col * colW;
        const ly = listY + row * lineH;
        doc.save().circle(lx + 3, ly + 5.5, 2.5).fill(PDF_BRAND).restore();
        doc
            .font(PDF_FONT.semibold)
            .fontSize(9.5)
            .fillColor(PDF_INK)
            .text(`Étape ${s.stepNumber}`, lx + 11, ly, { continued: true, lineBreak: false })
            .font(PDF_FONT.regular)
            .fillColor(PDF_MUTED)
            .text(s.completedAt ? `  ·  ${formatFrDate(s.completedAt)}` : "", { lineBreak: false });
    });
    doc.x = x;
    doc.y = listY + rows * lineH;
}

export function renderCrisisList(doc: PDFDoc, data: Pick<ReportData, "crisisItems">): void {
    sectionTitle(doc, "Liste de crise", 50);
    if (data.crisisItems.length === 0) {
        emptyState(doc, "Aucune stratégie de régulation enregistrée.");
        return;
    }

    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const count = data.crisisItems.length;
    doc
        .font(PDF_FONT.regular)
        .fontSize(9)
        .fillColor(PDF_MUTED)
        .text(`${count} stratégie${count > 1 ? "s" : ""} de régulation, dans l'ordre choisi par le parent.`, x, doc.y, { width: w });
    doc.y += 8;

    const tile = 22;
    const iconSize = 14;
    const textX = x + tile + 10;
    const textW = w - (textX - x);

    data.crisisItems.forEach((item, i) => {
        const label = `${i + 1}. ${item.label}`;
        doc.font(PDF_FONT.regular).fontSize(10.5);
        const lineH = doc.currentLineHeight(true);
        const textH = doc.heightOfString(label, { width: textW });
        const rowH = Math.max(tile, textH);
        ensureSpaceOrContinue(doc, rowH + 6, "Liste de crise");
        const y = doc.y;
        doc.save().roundedRect(x, y, tile, tile, 6).fill(PDF_SURFACE.peach).restore();
        drawCrisisIcon(doc, item.emoji, x + (tile - iconSize) / 2, y + (tile - iconSize) / 2, iconSize, PDF_INK);
        const textY = y + (tile - lineH) / 2;
        doc
            .font(PDF_FONT.semibold)
            .fillColor(PDF_MUTED)
            .text(`${i + 1}. `, textX, textY, { width: textW, continued: true })
            .font(PDF_FONT.regular)
            .fillColor(PDF_INK)
            .text(item.label);
        doc.x = x;
        doc.y = Math.max(doc.y, y + tile) + 6;
    });
}

export function renderRunningHeader(
    doc: PDFDoc,
    data: Pick<ReportData, "child" | "sinceDate" | "untilDate">,
): void {
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const y = 30;
    const markH = 12;
    drawMark(doc, x, y - 1, markH);
    const textX = x + markWidthForHeight(markH) + 8;
    const period = periodLabel(data.sinceDate, data.untilDate);
    doc.font(PDF_FONT.regular).fontSize(8.5);
    const periodW = doc.widthOfString(period);
    const titleW = w - (textX - x) - periodW - 16;
    doc
        .font(PDF_FONT.semibold)
        .fontSize(8.5)
        .fillColor(PDF_INK)
        .text(fitText(doc, `Rapport de suivi · ${data.child.name}`, titleW), textX, y, { lineBreak: false });
    doc
        .font(PDF_FONT.regular)
        .fontSize(8.5)
        .fillColor(PDF_MUTED)
        .text(period, x, y, { width: w, align: "right", lineBreak: false });
    doc.save().moveTo(x, y + 18).lineTo(x + w, y + 18).lineWidth(0.6).stroke(PDF_BORDER).restore();
}

export function renderFooter(
    doc: PDFDoc,
    data: Pick<ReportData, "parentName">,
    page: number,
    pageCount: number,
): void {
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    const y = doc.page.height - PDF_MARGIN.bottom + 16;
    const pageLabel = `Page ${page} sur ${pageCount}`;

    doc.save().moveTo(x, y).lineTo(x + w, y).lineWidth(0.6).stroke(PDF_BORDER).restore();

    doc.font(PDF_FONT.semibold).fontSize(8.5);
    const pageW = doc.widthOfString(pageLabel);
    doc.fillColor(PDF_INK).text(pageLabel, x + w - pageW, y + 9, { lineBreak: false });

    const logoH = 9;
    drawLogo(doc, x, y + 10, logoH);
    const infoX = x + logoWidthForHeight(logoH) + 10;
    const info = `Rapport généré le ${formatFrDate(new Date())} à partir des données saisies par ${data.parentName}`;
    doc
        .font(PDF_FONT.regular)
        .fontSize(8)
        .fillColor(PDF_MUTED)
        .text(fitText(doc, info, x + w - pageW - 16 - infoX), infoX, y + 9.5, { lineBreak: false });
    doc
        .font(PDF_FONT.semibold)
        .fontSize(8)
        .fillColor(PDF_INK)
        .text("Ce document aide le dialogue avec le soignant. Ce n'est pas un diagnostic médical.", x, y + 25, {
            width: w,
            lineBreak: false,
        });
}

export function renderPageFurniture(
    doc: PDFDoc,
    data: Pick<ReportData, "child" | "sinceDate" | "untilDate" | "parentName">,
): void {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const bottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        const page = i - range.start + 1;
        if (page > 1) renderRunningHeader(doc, data);
        renderFooter(doc, data, page, range.count);
        doc.page.margins.bottom = bottom;
    }
}
