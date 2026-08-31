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
  imageVersion: "abc12345",
  imageAlt: "Crise TDAH chez l'enfant — Connaissance TDAH · Tokō",
  section: "Connaissance TDAH",
  publishedAt: "2026-04-07T00:00:00+00:00",
  modifiedAt: "2026-04-09T00:00:00+00:00",
};

const IMAGE_URL =
  "https://toko.battistella.ovh/og/crise-tdah-enfant-guide-complet.png?v=abc12345";

describe("articleSlugFromPath", () => {
  it("matches an article path", () => {
    expect(articleSlugFromPath("/ressources/crise-tdah-enfant-guide-complet"))
      .toBe("crise-tdah-enfant-guide-complet");
    expect(articleSlugFromPath("/ressources/mon-article/")).toBe("mon-article");
  });

  it("matches the in-app path a signed-in parent copies out of the URL bar", () => {
    expect(articleSlugFromPath("/connaissances/rentree-scolaire-tdah-enfant"))
      .toBe("rentree-scolaire-tdah-enfant");
    expect(articleSlugFromPath("/connaissances/mon-article/")).toBe("mon-article");
  });

  it("ignores anything that is not a single article segment", () => {
    expect(articleSlugFromPath("/ressources")).toBeNull();
    expect(articleSlugFromPath("/ressources/")).toBeNull();
    expect(articleSlugFromPath("/connaissances")).toBeNull();
    expect(articleSlugFromPath("/connaissances/")).toBeNull();
    expect(articleSlugFromPath("/ressources/a/b")).toBeNull();
    expect(articleSlugFromPath("/connaissances/a/b")).toBeNull();
    expect(articleSlugFromPath("/dashboard/mon-article")).toBeNull();
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
    expect(html).toContain(`<meta property="og:image" content="${IMAGE_URL}" />`);
    expect(html).toContain(`<meta name="twitter:image" content="${IMAGE_URL}" />`);
    expect(html).not.toContain("og-image.png");
  });

  it("carries the Facebook-specific image tags", () => {
    expect(html).toContain(
      `<meta property="og:image:secure_url" content="${IMAGE_URL}" />`
    );
    expect(html).toContain('<meta property="og:image:type" content="image/png" />');
    // Both alt tags describe the article's own card, not the site-wide one.
    expect(html).not.toContain("Tokō — application TDAH pour parents");
    expect(
      html.match(new RegExp(`content="${entry.imageAlt}"`, "g"))
    ).toHaveLength(2);
  });

  it("dates and files the article the way Facebook reads an article page", () => {
    expect(html).toContain(
      'property="article:published_time" content="2026-04-07T00:00:00+00:00"'
    );
    expect(html).toContain(
      'property="article:modified_time" content="2026-04-09T00:00:00+00:00"'
    );
    expect(html).toContain(
      'property="og:updated_time" content="2026-04-09T00:00:00+00:00"'
    );
    expect(html).toContain(
      'property="article:section" content="Connaissance TDAH"'
    );
  });

  it("leaves out the article dates an entry does not carry", () => {
    const bare = injectArticleOgMeta(
      shell,
      { ...entry, publishedAt: undefined, modifiedAt: undefined, section: undefined },
      "https://toko.battistella.ovh"
    );
    expect(bare).not.toContain("article:published_time");
    expect(bare).not.toContain("article:modified_time");
    expect(bare).not.toContain("article:section");
  });

  it("shares the public /ressources URL even for the in-app path", () => {
    // Facebook canonicalises a story to og:url, so a parent who copies
    // /connaissances/<slug> out of the app still shares the public page.
    const slug = articleSlugFromPath("/connaissances/crise-tdah-enfant-guide-complet");
    expect(slug).toBe(entry.slug);
    expect(html).toContain(
      'property="og:url" content="https://toko.battistella.ovh/ressources/crise-tdah-enfant-guide-complet"'
    );
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
      '<meta property="og:image" content="/og/crise-tdah-enfant-guide-complet.png?v=abc12345" />'
    );
    // secure_url only means anything as an absolute https URL.
    expect(relative).not.toContain("og:image:secure_url");
  });

  it("serves the card unversioned when the manifest predates the digest", () => {
    const legacy = injectArticleOgMeta(
      shell,
      { ...entry, imageVersion: undefined },
      "https://toko.battistella.ovh"
    );
    expect(legacy).toContain(
      '<meta property="og:image" content="https://toko.battistella.ovh/og/crise-tdah-enfant-guide-complet.png" />'
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
    expect(article?.imageVersion).toMatch(/^[0-9a-f]{8}$/);
    expect(article?.section).toBe("Connaissance TDAH");
  });

  it("degrades to the default card when the manifest is missing", () => {
    expect(loadArticleOgManifest(resolve(WEB, "does-not-exist")).size).toBe(0);
  });
});
