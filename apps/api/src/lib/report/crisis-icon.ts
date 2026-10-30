import { crisisIconNameFor } from "@focusflow/mo/crisis-icons";
import { CRISIS_ICON_NODES } from "@focusflow/mo/crisis-icon-nodes";
import { escapeHtml } from "../format/escape-html";
import type { PDFDoc } from "./pdf/theme";

const STROKE_WIDTH = 2;
const VIEWBOX = 24;

export function crisisIconSvg(emoji: string | null | undefined, size: number, color: string): string {
    const nodes = CRISIS_ICON_NODES[crisisIconNameFor(emoji)];
    const body = nodes
        .map(([tag, attrs]) => {
            const serialized = Object.entries(attrs)
                .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
                .join(" ");
            return `<${tag} ${serialized}/>`;
        })
        .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" fill="none" stroke="${color}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px;margin-right:6px">${body}</svg>`;
}

export function drawCrisisIcon(
    doc: PDFDoc,
    emoji: string | null | undefined,
    x: number,
    y: number,
    size: number,
    color: string,
): void {
    const nodes = CRISIS_ICON_NODES[crisisIconNameFor(emoji)];
    doc.save();
    doc.translate(x, y).scale(size / VIEWBOX);
    doc.lineWidth(STROKE_WIDTH).lineCap("round").lineJoin("round").strokeColor(color);
    for (const [tag, a] of nodes) {
        if (tag === "path") {
            doc.path(a["d"] ?? "").stroke();
        } else if (tag === "line") {
            doc.moveTo(Number(a["x1"]), Number(a["y1"])).lineTo(Number(a["x2"]), Number(a["y2"])).stroke();
        } else if (tag === "circle") {
            doc.circle(Number(a["cx"]), Number(a["cy"]), Number(a["r"])).stroke();
        } else if (tag === "rect") {
            doc.roundedRect(
                Number(a["x"]),
                Number(a["y"]),
                Number(a["width"]),
                Number(a["height"]),
                Number(a["rx"] ?? 0),
            ).stroke();
        }
    }
    doc.restore();
}
