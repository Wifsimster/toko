import type { MoArt, MoPath } from "./types";

export const GARDEN_INK = "#1E2A2E";
export const GARDEN_LEAF = "#6E9E7C";
export const GARDEN_LEAF_FRESH = "#9CC7A4";
export const GARDEN_MAX_DRAWN_LEAVES = 14;

const POT_TOP = 168;
const STEP = 10;

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function leafPath(index: number, fresh: boolean): MoPath {
  const side = index % 2 === 0 ? -1 : 1;
  const y = POT_TOP - 16 - index * STEP;
  const x = 100 + side * 2;
  const tipX = x + side * 26;
  const tipY = y - 24;
  return {
    d: `M${round(x)} ${round(y)} C ${round(x + side * 18)} ${round(y - 4)}, ${round(tipX + side * 2)} ${round(tipY + 10)}, ${round(tipX)} ${round(tipY)} C ${round(tipX - side * 14)} ${round(tipY + 2)}, ${round(x + side * 2)} ${round(y - 14)}, ${round(x)} ${round(y)} Z`,
    fill: fresh ? GARDEN_LEAF_FRESH : GARDEN_LEAF,
    stroke: GARDEN_INK,
    strokeWidth: 2,
  };
}

export function gardenDrawnLeaves(leaves: number): number {
  if (!Number.isFinite(leaves) || leaves <= 0) return 0;
  return Math.min(Math.floor(leaves), GARDEN_MAX_DRAWN_LEAVES);
}

export function gardenArt(leaves: number, options: { freshLast?: boolean } = {}): MoArt {
  const drawn = gardenDrawnLeaves(leaves);
  const stemTop = POT_TOP - 20 - Math.max(drawn, 1) * STEP;
  const paths: MoPath[] = [
    { d: "M30 222 C 30 214, 170 214, 170 222 C 170 230, 30 230, 30 222 Z", fill: "#E6DDCB", part: "shadow" },
    {
      d: `M100 ${POT_TOP} C 98 ${round(stemTop + 40)}, 104 ${round(stemTop + 20)}, 100 ${round(stemTop)}`,
      stroke: GARDEN_INK,
      strokeWidth: 2.5,
      fill: "none",
    },
  ];
  for (let i = 0; i < drawn; i++) {
    paths.push(leafPath(i, options.freshLast === true && i === drawn - 1));
  }
  paths.push(
    { d: `M62 ${POT_TOP + 6} H138 L129 220 H71 Z`, fill: "#E9A27A", stroke: GARDEN_INK, strokeWidth: 2.5 },
    { d: `M58 ${POT_TOP} H142 V${POT_TOP + 10} H58 Z`, fill: "#F0B591", stroke: GARDEN_INK, strokeWidth: 2.5 },
  );
  return { viewBox: "0 0 200 232", paths, ground: [100, 222] };
}
