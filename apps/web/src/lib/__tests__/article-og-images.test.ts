import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { articles } from "../resources-data";

const OG_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../public/og"
);

const manifest: Array<{ slug: string; title: string; image: string }> =
  JSON.parse(readFileSync(resolve(OG_DIR, "articles.json"), "utf-8"));

// The cards are committed rather than built, so a new article ships without a
// share preview unless `pnpm og:articles` is re-run. This test is the reminder.
describe("share previews", () => {
  it("has one image per article", () => {
    for (const article of articles) {
      expect(
        existsSync(resolve(OG_DIR, `${article.slug}.png`)),
        `missing /og/${article.slug}.png — run \`pnpm --filter @focusflow/web og:articles\``
      ).toBe(true);
    }
  });

  it("has a manifest entry per article, with the current title", () => {
    expect(manifest).toHaveLength(articles.length);
    for (const article of articles) {
      const entry = manifest.find((m) => m.slug === article.slug);
      expect(entry, `no manifest entry for ${article.slug}`).toBeDefined();
      expect(entry?.title).toBe(article.metaTitle);
      expect(entry?.image).toBe(`/og/${article.slug}.png`);
    }
  });
});
