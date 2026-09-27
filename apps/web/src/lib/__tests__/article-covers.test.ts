import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { articles } from "../resources-data";

const PUBLIC_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../public"
);

// Covers are hand-made illustrations committed under public/articles/. A wrong
// path ships a broken image at the very top of the article, so it is checked
// here rather than discovered in production.
describe("article covers", () => {
  const withCover = articles.filter((article) => article.cover);

  it("points at a file that exists", () => {
    for (const article of withCover) {
      const src = article.cover!.src;
      expect(src.startsWith("/"), `${article.slug}: cover src must be absolute`)
        .toBe(true);
      expect(
        existsSync(resolve(PUBLIC_DIR, src.slice(1))),
        `missing public${src} for ${article.slug}`
      ).toBe(true);
    }
  });

  // Animated covers: the poster (`src`) is checked above; every declared video
  // source must exist too, and at least one must be declared.
  it("points at video files that exist for animated covers", () => {
    const animated = withCover.filter((article) => article.cover!.video);
    expect(animated.length, "no animated cover to check").toBeGreaterThan(0);
    for (const article of animated) {
      const sources = Object.values(article.cover!.video!).filter(Boolean);
      expect(sources.length, `${article.slug}: cover video has no source`)
        .toBeGreaterThan(0);
      for (const src of sources) {
        expect(src.startsWith("/"), `${article.slug}: video src must be absolute`)
          .toBe(true);
        expect(
          existsSync(resolve(PUBLIC_DIR, src.slice(1))),
          `missing public${src} for ${article.slug}`
        ).toBe(true);
      }
    }
  });

  it("declares alt text and intrinsic dimensions", () => {
    for (const article of withCover) {
      const cover = article.cover!;
      expect(cover.alt.length, `${article.slug}: cover alt is empty`)
        .toBeGreaterThan(0);
      expect(cover.width, `${article.slug}: cover width`).toBeGreaterThan(0);
      expect(cover.height, `${article.slug}: cover height`).toBeGreaterThan(0);
    }
  });
});
