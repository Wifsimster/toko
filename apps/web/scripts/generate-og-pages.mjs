import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { readArticles } from "./lib/read-articles.mjs";
import { renderOgCard } from "./lib/og-template.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "og", "pages");
const manifestPath = resolve(here, "..", "public", "og", "pages.json");

const articles = await readArticles();

const pages = [
  {
    path: "/ressources",
    headline: "Comprendre et accompagner votre enfant TDAH",
    subject: "Ressources gratuites",
    note: `${articles.length} guides`,
    title: "Ressources TDAH enfant : guides pour parents francophones | Tokō",
    description:
      "Guides clairs pour comprendre et accompagner votre enfant TDAH : crises, sommeil, devoirs, co-régulation, hypersensibilité. Rédigés par et pour des parents.",
    imageAlt: "Ressources TDAH pour les parents — Tokō",
  },
  {
    path: "/ressources/lexique",
    headline: "MDPH, PAP, AESH, SESSAD : les sigles expliqués",
    subject: "Lexique",
    title: "Lexique TDAH, école et handicap : tous les sigles expliqués | Tokō",
    description:
      "MDPH, PAP, PAI, AESH, PPS, AEEH, SESSAD, GEVASCO… Le lexique des sigles médicaux, scolaires et administratifs expliqués simplement aux parents.",
    imageAlt: "Lexique TDAH, école et handicap — Tokō",
  },
  {
    path: "/ressources/plan-de-crise",
    headline: "Mon plan de crise TDAH",
    subject: "Modèle à imprimer",
    note: "Gratuit, 1 page",
    title: "Mon plan de crise TDAH — modèle à imprimer | Tokō",
    description:
      "Modèle gratuit de plan de crise TDAH à imprimer et afficher. Trois colonnes : signes de montée, mes gestes, ce que je ne fais plus.",
    imageAlt: "Mon plan de crise TDAH, modèle à imprimer — Tokō",
  },
];

function fileNameFor(path) {
  return `${path.replace(/^\//, "").replace(/\//g, "-")}.png`;
}

mkdirSync(outDir, { recursive: true });

const expected = new Set(pages.map((page) => fileNameFor(page.path)));
for (const file of readdirSync(outDir)) {
  if (file.endsWith(".png") && !expected.has(file)) {
    rmSync(join(outDir, file));
    console.log(`- removed stale ${file}`);
  }
}

const manifest = [];
let totalBytes = 0;

for (const page of pages) {
  const svg = renderOgCard({
    title: page.headline,
    subject: page.subject,
    note: page.note,
  });

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "sans-serif",
    },
    background: "#fdf9f4",
  })
    .render()
    .asPng();

  const fileName = fileNameFor(page.path);
  writeFileSync(join(outDir, fileName), png);
  totalBytes += png.byteLength;

  manifest.push({
    path: page.path,
    title: page.title,
    description: page.description,
    image: `/og/pages/${fileName}`,
    imageVersion: createHash("sha256").update(png).digest("hex").slice(0, 8),
    imageAlt: page.imageAlt,
  });
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `ok ${manifest.length} images + pages.json — ${(totalBytes / 1024).toFixed(0)} kB total`
);
