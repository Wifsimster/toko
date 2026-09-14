// Renders one share-preview image per standalone resource page into
// public/og/pages/<name>.png (1200x630), plus public/og/pages.json — the
// manifest the API reads to put the right <meta og:image> in index.html
// for crawlers, which never run the SPA's JavaScript.
//
// `pnpm og:articles` covers /ressources/<slug>; this covers the pages around
// them — the hub itself, the lexicon, the crisis-plan template — which would
// otherwise fall back to the generic site card. The hub is the link parents
// share most often, so it gets a card that says what is behind it.
//
// The titles and descriptions here must stay in step with the `useSeoHead`
// call of each page (apps/web/src/routes/ressources/), which is what a
// visitor's browser tab and Google see. Outputs are committed, so the Docker
// build doesn't need a rendering toolchain.

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

/**
 * The pages that get their own card. `headline` is what the card shows —
 * short, in the reader's words; `title` and `description` are the <title>
 * and meta description the crawler reads.
 */
const pages = [
  {
    path: "/ressources",
    // The card headline answers "what will I find if I click?" rather than
    // repeating the section name already in the eyebrow.
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

/** `/ressources/lexique` → `ressources-lexique.png`. */
function fileNameFor(path) {
  return `${path.replace(/^\//, "").replace(/\//g, "-")}.png`;
}

mkdirSync(outDir, { recursive: true });

// Drop cards of pages that no longer exist, so a removed or renamed page
// doesn't leave a stale image behind in the deployed bundle.
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
      // The brand font ships as woff2 only, which resvg can't read; the
      // system sans is close enough at share-preview size.
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
    // Facebook caches a share image by URL and keeps serving the old one
    // long after the file changes. The digest of the bytes we just wrote
    // rides along as `?v=` so a redesigned card is a new URL to the
    // scraper, while the file itself keeps its stable name.
    imageVersion: createHash("sha256").update(png).digest("hex").slice(0, 8),
    imageAlt: page.imageAlt,
  });
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `✓ ${manifest.length} images + pages.json — ${(totalBytes / 1024).toFixed(0)} kB total`
);
