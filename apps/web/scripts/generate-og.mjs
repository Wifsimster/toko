// Rasterizes public/og-image.svg to public/og-image.png (1200x630).
// Open Graph crawlers (Facebook, LinkedIn, X/Twitter, Slack, Discord)
// support PNG share previews reliably; SVG support remains inconsistent.
// The SVG is the source of truth — re-run `pnpm og:generate` after edits.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(here, "..", "public", "og-image.svg");
const pngPath = resolve(here, "..", "public", "og-image.png");

const svg = readFileSync(svgPath);

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: {
    // Falls back to whatever sans-serif the host has. The fontsource
    // packages ship woff2 (unsupported by resvg), so we don't point at
    // them — system DejaVu/Helvetica is close enough for share previews.
    loadSystemFonts: true,
    defaultFontFamily: "sans-serif",
  },
  background: "#fdf9f4",
});

const png = resvg.render().asPng();
writeFileSync(pngPath, png);

console.log(`✓ ${pngPath} — ${(png.byteLength / 1024).toFixed(1)} kB`);
