import { readFileSync } from "node:fs";
import type PDFDocument from "pdfkit";

export type PDFDoc = InstanceType<typeof PDFDocument>;

export const PDF_MARGIN = { top: 64, bottom: 78, left: 50, right: 50 } as const;
export const PDF_PAGE_MARGIN = PDF_MARGIN.left;

export const PDF_INK = "#1E2A2E";
export const PDF_MUTED = "#4F585E";
export const PDF_BRAND = "#358891";
export const PDF_BRAND_STRONG = "#23676E";
export const PDF_LOGO_INK = "#1f2937";
export const PDF_BORDER = "#E8E0D3";
export const PDF_RULE = "#C9BFB0";
export const PDF_CREAM = "#FBF6EE";
export const PDF_SAND = "#F3ECE1";
export const PDF_SUCCESS_TEXT = "#047857";
export const PDF_DANGER_TEXT = "#9B2C2C";

export const PDF_SURFACE = {
    mint: "#DCEFE8",
    peach: "#FBE1CF",
    lavender: "#E6E2F4",
    neutral: PDF_SAND,
} as const;

export type PdfSurface = keyof typeof PDF_SURFACE;

export const PDF_FONT = {
    regular: "Jakarta-Regular",
    semibold: "Jakarta-SemiBold",
    extrabold: "Jakarta-ExtraBold",
} as const;

type FontWeight = keyof typeof PDF_FONT;

const FONT_FILES: Record<FontWeight, string> = {
    regular: "PlusJakartaSans-Regular.ttf",
    semibold: "PlusJakartaSans-SemiBold.ttf",
    extrabold: "PlusJakartaSans-ExtraBold.ttf",
};

let fontBuffers: Record<FontWeight, Buffer> | null = null;

function loadFonts(): Record<FontWeight, Buffer> {
    if (!fontBuffers) {
        const read = (file: string) => readFileSync(new URL(`./fonts/${file}`, import.meta.url));
        fontBuffers = {
            regular: read(FONT_FILES.regular),
            semibold: read(FONT_FILES.semibold),
            extrabold: read(FONT_FILES.extrabold),
        };
    }
    return fontBuffers;
}

export function registerBrandFonts(doc: PDFDoc): void {
    const buffers = loadFonts();
    for (const weight of Object.keys(PDF_FONT) as FontWeight[]) {
        doc.registerFont(PDF_FONT[weight], buffers[weight]);
    }
    doc.font(PDF_FONT.regular);
}

export const FONT_COVERAGE: ReadonlyArray<readonly [number, number]> = [
    [0x20, 0x7e],
    [0xa0, 0xac],
    [0xae, 0x148],
    [0x14a, 0x17e],
    [0x192, 0x192],
    [0x2c6, 0x2c7],
    [0x2d8, 0x2dc],
    [0x2010, 0x2010],
    [0x2012, 0x2015],
    [0x2018, 0x201a],
    [0x201c, 0x201e],
    [0x2020, 0x2022],
    [0x2026, 0x2026],
    [0x2030, 0x2030],
    [0x2032, 0x2033],
    [0x2039, 0x203a],
    [0x2044, 0x2044],
    [0x20ac, 0x20ac],
    [0x2122, 0x2122],
    [0x2190, 0x2195],
    [0x2212, 0x2212],
    [0x2248, 0x2248],
    [0x2260, 0x2260],
    [0x2264, 0x2265],
];

export function fontCovers(codePoint: number): boolean {
    return FONT_COVERAGE.some(([start, end]) => codePoint >= start && codePoint <= end);
}

const SPACE_LIKE = /[\t  -   　]/u;
const INVISIBLE_RANGES: ReadonlyArray<readonly [number, number]> = [
    [0xad, 0xad],
    [0x200b, 0x200d],
    [0x2060, 0x2060],
    [0xfe00, 0xfe0f],
    [0xe0020, 0xe007f],
    [0x1f3fb, 0x1f3ff],
];
const isInvisible = (cp: number) => INVISIBLE_RANGES.some(([start, end]) => cp >= start && cp <= end);
const PICTOGRAPHIC = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

const CHAR_EQUIVALENTS: Readonly<Record<string, string>> = {
    "\u02bc": "\u2019",
    "\u02b9": "'",
    "\u02bb": "\u2018",
    "\u02c8": "'",
    "\u2011": "-",
    "\u2043": "-",
    "\u2024": ".",
    "\u2027": "\u00b7",
    "\u2236": ":",
    "\u2215": "/",
};

function mapChars(value: string): string {
    let out = "";
    for (const char of value.normalize("NFC")) {
        const cp = char.codePointAt(0)!;
        if (char === "\n" || fontCovers(cp)) {
            out += char;
        } else if (char === "\r") {
            continue;
        } else if (SPACE_LIKE.test(char)) {
            out += " ";
        } else if (CHAR_EQUIVALENTS[char] !== undefined) {
            out += CHAR_EQUIVALENTS[char];
        } else if (isInvisible(cp) || PICTOGRAPHIC.test(char)) {
            continue;
        } else {
            const compat = char.normalize("NFKD").replace(/\p{M}/gu, "");
            if (compat && compat !== char) {
                const mapped = mapChars(compat);
                out += [...mapped].every((c) => c === " " || fontCovers(c.codePointAt(0)!)) ? mapped : "?";
            } else {
                const base = char.normalize("NFD").replace(/\p{M}/gu, "");
                out += base && [...base].every((c) => fontCovers(c.codePointAt(0)!)) ? base : "?";
            }
        }
    }
    return out;
}

export function pdfSafeText(value: string): string {
    return mapChars(value).replace(/[ ]{2,}/g, " ").trim();
}

export function pageWidth(doc: PDFDoc): number {
    return doc.page.width - PDF_MARGIN.left - PDF_MARGIN.right;
}

export function pageBottom(doc: PDFDoc): number {
    return doc.page.height - PDF_MARGIN.bottom;
}

export function ensureSpace(doc: PDFDoc, height: number): void {
    if (doc.y + height > pageBottom(doc)) {
        doc.addPage();
        doc.x = PDF_MARGIN.left;
    }
}

export function sectionTitle(doc: PDFDoc, title: string, keepWith = 60): void {
    doc.font(PDF_FONT.extrabold).fontSize(13);
    const titleH = doc.currentLineHeight(true);
    if (doc.y > PDF_MARGIN.top + 1) doc.y += 18;
    ensureSpace(doc, titleH + 10 + keepWith);
    const x = PDF_MARGIN.left;
    const y = doc.y;
    doc.save().roundedRect(x, y + 3, 3, titleH - 6, 1.5).fill(PDF_BRAND).restore();
    doc
        .font(PDF_FONT.extrabold)
        .fontSize(13)
        .fillColor(PDF_INK)
        .text(title, x + 11, y, { width: pageWidth(doc) - 11, characterSpacing: -0.2, lineBreak: false });
    doc.x = x;
    doc.y = y + titleH + 8;
}

export function emptyState(doc: PDFDoc, message: string): void {
    const x = PDF_MARGIN.left;
    const w = pageWidth(doc);
    doc.font(PDF_FONT.regular).fontSize(9.5);
    const textH = doc.heightOfString(message, { width: w - 24 });
    const h = textH + 18;
    ensureSpace(doc, h);
    const y = doc.y;
    doc.save().roundedRect(x, y, w, h, 8).dash(3, { space: 3 }).lineWidth(0.8).stroke(PDF_RULE).undash().restore();
    doc.fillColor(PDF_MUTED).text(message, x + 12, y + 9, { width: w - 24 });
    doc.x = x;
    doc.y = y + h;
}

export function formatScore(value: number): string {
    return value.toFixed(1).replace(".", ",");
}

export function formatSigned(value: number): string {
    const abs = formatScore(Math.abs(value));
    if (abs === "0,0") return abs;
    return `${value > 0 ? "+" : "−"}${abs}`;
}

export function fitText(doc: PDFDoc, text: string, width: number): string {
    if (doc.widthOfString(text) <= width) return text;
    let out = text;
    while (out.length > 1 && doc.widthOfString(`${out}…`) > width) out = out.slice(0, -1);
    return `${out.trimEnd()}…`;
}
