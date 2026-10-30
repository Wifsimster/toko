import { inflateSync } from "node:zlib";

interface PdfObject {
    dict: string;
    stream: string | null;
}

function parseObjects(pdf: Buffer): Map<string, PdfObject> {
    const raw = pdf.toString("latin1");
    const objects = new Map<string, PdfObject>();
    for (const m of raw.matchAll(/(\d+) 0 obj\s*([\s\S]*?)endobj/g)) {
        const body = m[2]!;
        const streamAt = body.search(/stream\r?\n/);
        let stream: string | null = null;
        if (streamAt >= 0) {
            const start = streamAt + body.slice(streamAt).indexOf("\n") + 1;
            const end = body.lastIndexOf("endstream");
            const bytes = Buffer.from(body.slice(start, end), "latin1");
            try {
                stream = inflateSync(bytes).toString("latin1");
            } catch {
                stream = bytes.toString("latin1");
            }
        }
        objects.set(m[1]!, { dict: streamAt >= 0 ? body.slice(0, streamAt) : body, stream });
    }
    return objects;
}

function parseToUnicode(cmap: string): Map<number, string> {
    const map = new Map<number, string>();
    for (const range of cmap.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*\[([^\]]*)\]/g)) {
        let code = parseInt(range[1]!, 16);
        for (const entry of range[3]!.matchAll(/<([0-9a-fA-F ]*)>/g)) {
            const units = entry[1]!.trim().split(/\s+/).filter(Boolean).map((h) => parseInt(h, 16));
            map.set(code++, String.fromCharCode(...units));
        }
    }
    return map;
}

export function countPdfPages(pdf: Buffer): number {
    return (pdf.toString("latin1").match(/\/Type \/Page[^s]/g) ?? []).length;
}

export function pdfContent(pdf: Buffer): string {
    return [...parseObjects(pdf).values()]
        .filter((o) => o.stream !== null && !o.dict.includes("/Length1") && !o.dict.includes("/Subtype /Image"))
        .map((o) => o.stream)
        .join("\n");
}

export function pdfFontNames(pdf: Buffer): string[] {
    return Array.from(pdf.toString("latin1").matchAll(/\/BaseFont \/([A-Za-z0-9+-]+)/g), (m) => m[1]!);
}

export function pdfTextRuns(pdf: Buffer): string[] {
    const objects = parseObjects(pdf);
    const fontMaps = new Map<string, Map<number, string>>();
    for (const [id, obj] of objects) {
        const ref = obj.dict.match(/\/ToUnicode (\d+) 0 R/);
        if (!ref) continue;
        const cmap = objects.get(ref[1]!)?.stream;
        if (cmap) fontMaps.set(id, parseToUnicode(cmap));
    }
    const resourceFonts = new Map<string, Map<number, string>>();
    for (const obj of objects.values()) {
        for (const m of obj.dict.matchAll(/\/(F\d+) (\d+) 0 R/g)) {
            const map = fontMaps.get(m[2]!);
            if (map) resourceFonts.set(m[1]!, map);
        }
    }

    const runs: string[] = [];
    for (const obj of objects.values()) {
        if (!obj.stream || !obj.stream.includes("Tf")) continue;
        let current: Map<number, string> | undefined;
        for (const m of obj.stream.matchAll(/\/(F\d+) [\d.]+ Tf|\[((?:[^\]])*)\]\s*TJ/g)) {
            if (m[1]) {
                current = resourceFonts.get(m[1]);
                continue;
            }
            const text = Array.from(m[2]!.matchAll(/<([0-9a-fA-F]*)>/g))
                .map((hex) => {
                    const codes = hex[1]!.replace(/\s/g, "").match(/.{4}/g) ?? [];
                    return codes.map((c) => current?.get(parseInt(c, 16)) ?? "�").join("");
                })
                .join("");
            runs.push(text);
        }
    }
    return runs;
}

export function pdfText(pdf: Buffer): string {
    return pdfTextRuns(pdf).join("\n");
}
