import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  articleSlugFromPath,
  injectArticleOgMeta,
  loadArticleOgManifest,
  siteOriginFromHtml,
} from "../lib/article-og";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(__dirname, "../../../../apps/web");

const shell = readFileSync(resolve(WEB, "index.html"), "utf-8");

const entry = {
  slug: "crise-tdah-enfant-guide-complet",
  title: 'Crise TDAH enfant : que faire ? Guide "complet" | Tokō',
  description: "Comprendre le cerveau TDAH en crise, désamorcer, co-réguler.",
  image: "/og/crise-tdah-enfant-guide-complet.png",
  imageAlt: "Crise TDAH chez l'enfant — Connaissance TDAH · Tokō",
};

describe("articleSlugFromPath", () => {
  it("matches an article path", () => {
    expect(articleSlugFromPath("/ressources/crise-tdah-enfant-guide-complet"))
      .toBe("crise-tdah-enfant-guide-complet");
    expect(articleSlugFromPath("/ressources/mon-article/")).toBe("mon-article");
  });

  it("ignores anything that is not a single article segment", () => {
    expect(articleSlugFromPath("/ressources")).toBeNull();
    expect(articleSlugFromPath("/ressources/")).toBeNull();
    expect(articleSlugFromPath("/connaissances/mon-article")).toBeNull();
    expect(articleSlugFromPath("/ressources/a/b")).toBeNull();
  });
});

describe("siteOriginFromHtml", () => {
  it("reads the canonical origin out of the shell", () => {
    expect(siteOriginFromHtml(shell)).toBe("https://toko.battistella.ovh");
  });

  it("returns null when the shell has no og:url", () => {
    expect(siteOriginFromHtml("<html><head></head></html>")).toBeNull();
  });
});

describe("injectArticleOgMeta", () => {
  const html = injectArticleOgMeta(shell, entry, "https://toko.battistella.ovh");

  it("points the share image at the article's own card", () => {
    expect(html).toContain(
      '<meta property="og:image" content="https://toko.battistella.ovh/og/crise-tdah-enfant-guide-complet.png" />'
    );
    expect(html).toContain(
      '<meta name="twitter:image" content="https://toko.battistella.ovh/og/crise-tdah-enfant-guide-complet.png" />'
    );
    expect(html).not.toContain("og-image.png");
  });

  it("rewrites title, description, type, url and canonical", () => {
    expect(html).toContain(
      "<title>Crise TDAH enfant : que faire ? Guide &quot;complet&quot; | Tokō</title>"
    );
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain(
      'property="og:url" content="https://toko.battistella.ovh/ressources/crise-tdah-enfant-guide-complet"'
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://toko.battistella.ovh/ressources/crise-tdah-enfant-guide-complet" />'
    );
    expect(html).toContain(`content="${entry.description}"`);
  });

  it("escapes quotes so the head stays well-formed", () => {
    expect(html).toContain("Guide &quot;complet&quot;");
  });

  it("keeps the image dimensions and the rest of the document", () => {
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('"@context": "https://schema.org"');
    expect(html.split("<title>").length).toBe(2);
  });

  it("falls back to a root-relative image without a known origin", () => {
    const relative = injectArticleOgMeta(shell, entry, null);
    expect(relative).toContain(
      '<meta property="og:image" content="/og/crise-tdah-enfant-guide-complet.png" />'
    );
  });
});

describe("loadArticleOgManifest", () => {
  it("loads the generated manifest from the frontend bundle", () => {
    // public/ is copied verbatim into dist/, so the built layout matches.
    const manifest = loadArticleOgManifest(resolve(WEB, "public"));
    expect(manifest.size).toBeGreaterThan(0);
    const article = manifest.get("crise-tdah-enfant-guide-complet");
    expect(article?.image).toBe("/og/crise-tdah-enfant-guide-complet.png");
  });

  it("degrades to the default card when the manifest is missing", () => {
    expect(loadArticleOgManifest(resolve(WEB, "does-not-exist")).size).toBe(0);
  });
});
