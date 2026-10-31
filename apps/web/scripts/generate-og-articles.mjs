import { createHash } from "node:crypto";
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

const expected = new Set(articles.map((a) => `${a.slug}.png`));
for (const file of readdirSync(outDir)) {
  if (file.endsWith(".png") && !expected.has(file)) {
    rmSync(join(outDir, file));
    console.log(`- removed stale ${file}`);
  }
}

function isoTimestamp(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ""))
    ? `${date}T00:00:00+00:00`
    : undefined;
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
    imageVersion: createHash("sha256").update(png).digest("hex").slice(0, 8),
    imageAlt: `${article.title} — ${clusterLabel(article.cluster)} · Tokō`,
    section: clusterLabel(article.cluster),
    publishedAt: isoTimestamp(article.publishedAt),
    modifiedAt: isoTimestamp(article.lastReviewedAt ?? article.publishedAt),
  });
}

writeFileSync(
  join(outDir, "articles.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(
  `ok ${manifest.length} images + articles.json — ${(totalBytes / 1024).toFixed(0)} kB total`
);
