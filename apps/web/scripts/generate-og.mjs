// Rasterizes the Open Graph share images to PNG (1200x630).
// OG crawlers (Facebook, LinkedIn, X/Twitter, Slack, Discord) support PNG
// previews reliably; SVG support remains inconsistent.
//
//  - public/og-image.png       site-wide default (source: public/og-image.svg)
//  - public/og/<cluster>.png   per-cluster article previews (templated below)
//
// Re-run `pnpm og:generate` after editing og-image.svg or the CLUSTERS list.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");

function rasterize(svg) {
  // The fontsource packages ship woff2 (unsupported by resvg), so we rely on
  // whatever sans-serif the host has — system DejaVu/Helvetica is close
  // enough for share previews.
  return new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { loadSystemFonts: true, defaultFontFamily: "sans-serif" },
    background: "#fdf9f4",
  })
    .render()
    .asPng();
}

function write(path, png) {
  writeFileSync(path, png);
  console.log(`✓ ${path} — ${(png.byteLength / 1024).toFixed(1)} kB`);
}

// 1. Site-wide share image — the SVG is the hand-designed source of truth.
write(
  resolve(publicDir, "og-image.png"),
  rasterize(readFileSync(resolve(publicDir, "og-image.svg"))),
);

// 2. Per-cluster article previews. The `key` values must stay in sync with
//    CLUSTER_OG_IMAGE in apps/web/src/lib/resources-data.tsx.
const CLUSTERS = [
  { key: "connaissance-tdah", accent: "#7c3aed", lines: ["Comprendre", "le TDAH"] },
  { key: "gestion-barkley", accent: "#059669", lines: ["Guide de gestion", "Barkley"] },
  { key: "parents", accent: "#e11d48", lines: ["Ressources", "pour les parents"] },
  { key: "parcours-de-soin", accent: "#0d9488", lines: ["Parcours de soin", "en France"] },
  { key: "entourage", accent: "#0284c7", lines: ["Expliquer le TDAH", "à l'entourage"] },
];

const HEART =
  "M60 92c-1.5 0-3-0.6-4.1-1.7L33.5 67.9c-6-6-6-15.8 0-21.8 5.3-5.3 13.5-6 " +
  "19.5-1.9l7 4.8 7-4.8c6-4.1 14.2-3.4 19.5 1.9 6 6 6 15.8 0 21.8L64.1 90.3C63 " +
  "91.4 61.5 92 60 92z";

function clusterSvg({ accent, lines }) {
  const startY = 396 + (2 - lines.length) * 44;
  const headline = lines
    .map((line, i) => {
      const fill = i === lines.length - 1 ? accent : "#1f2937";
      return `<text x="96" y="${startY + i * 92}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="74" fill="${fill}" letter-spacing="-2">${line}</text>`;
    })
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#fdf9f4"/>
      <stop offset="100%" stop-color="#f4ebdf"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="300" fill="${accent}" opacity="0.07"/>
  <circle cx="120" cy="560" r="220" fill="${accent}" opacity="0.05"/>
  <g transform="translate(96, 84)">
    <rect width="120" height="120" rx="28" fill="${accent}"/>
    <path d="${HEART}" fill="#fdf9f4"/>
  </g>
  <text x="244" y="174" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="84" fill="#1f2937" letter-spacing="-2">Tokō</text>
  <text x="96" y="${startY - 76}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="26" fill="${accent}" letter-spacing="4">RESSOURCE TOKŌ</text>
  ${headline}
  <text x="96" y="582" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="500" font-size="22" fill="${accent}" opacity="0.65">toko.battistella.ovh/ressources</text>
</svg>`;
}

const ogDir = resolve(publicDir, "og");
mkdirSync(ogDir, { recursive: true });
for (const cluster of CLUSTERS) {
  write(resolve(ogDir, `${cluster.key}.png`), rasterize(clusterSvg(cluster)));
}
