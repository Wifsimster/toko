// Renders one share-preview image per resource article into
// public/og/<slug>.png (1200x630), plus public/og/articles.json — the
// manifest the API reads to put the right <meta og:image> in index.html
// for crawlers, which never run the SPA's JavaScript.
//
// Article metadata is the source of truth: re-run `pnpm og:articles` after
// adding an article or editing a title. Outputs are committed, so the
// Docker build doesn't need a rendering toolchain.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { readArticles } from "./lib/read-articles.mjs";
import { renderArticleOgSvg, clusterLabel } from "./lib/og-template.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "og");

const articles = await readArticles();

mkdirSync(outDir, { recursive: true });

// Drop images of articles that no longer exist, so a renamed slug doesn't
// leave a stale card behind in the deployed bundle.
const expected = new Set(articles.map((a) => `${a.slug}.png`));
for (const file of readdirSync(outDir)) {
  if (file.endsWith(".png") && !expected.has(file)) {
    rmSync(join(outDir, file));
    console.log(`- removed stale ${file}`);
  }
}

const manifest = [];
let totalBytes = 0;

for (const article of articles) {
  const svg = renderArticleOgSvg({
    title: article.title,
    cluster: article.cluster,
    readTime: article.readTime,
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

  writeFileSync(join(outDir, `${article.slug}.png`), png);
  totalBytes += png.byteLength;

  manifest.push({
    slug: article.slug,
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? "",
    image: `/og/${article.slug}.png`,
    imageAlt: `${article.title} — ${clusterLabel(article.cluster)} · Tokō`,
  });
}

writeFileSync(
  join(outDir, "articles.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(
  `✓ ${manifest.length} images + articles.json — ${(totalBytes / 1024).toFixed(0)} kB total`
);
