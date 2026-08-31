// Per-article share previews (Open Graph) for the SPA shell.
//
// Facebook, WhatsApp, LinkedIn, Slack and X read the HTML they get and never
// run the app's JavaScript, so the <meta> tags the React article page sets
// are invisible to them: every shared resource link would otherwise show the
// generic Tokō card. Here the SPA fallback rewrites the head of index.html
// for /ressources/<slug> with that article's title, description and image.
//
// The manifest and the images are produced by `pnpm --filter @focusflow/web
// og:articles` from apps/web/src/lib/resources-data.tsx and shipped in the
// frontend bundle, so this file never needs to know the article list.

import fs from "node:fs";
import path from "node:path";

export interface ArticleOgEntry {
  slug: string;
  title: string;
  description: string;
  /** Root-relative path of the 1200x630 card, e.g. `/og/mon-article.png`. */
  image: string;
  imageAlt: string;
}

const MANIFEST_RELATIVE_PATH = path.join("og", "articles.json");

/** `/ressources/mon-article` → `mon-article`. Ignores anything deeper. */
export function articleSlugFromPath(pathname: string): string | null {
  const match = /^\/ressources\/([a-z0-9-]+)\/?$/i.exec(pathname);
  return match?.[1] ?? null;
}

/**
 * Reads the manifest emitted next to the generated cards. Returns an empty
 * map when it is missing (older bundle, or a build that skipped the
 * generator) — pages then keep the default card rather than failing.
 */
export function loadArticleOgManifest(
  frontendPath: string
): Map<string, ArticleOgEntry> {
  const manifestPath = path.join(frontendPath, MANIFEST_RELATIVE_PATH);
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (!Array.isArray(parsed)) throw new Error("expected an array");
    const entries = parsed as ArticleOgEntry[];
    return new Map(entries.map((entry) => [entry.slug, entry]));
  } catch (error) {
    console.warn(
      `[og] no per-article share previews (${manifestPath}): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return new Map();
  }
}

/**
 * The public origin, taken from the canonical og:url already baked into
 * index.html. Open Graph requires absolute image URLs, and the request's own
 * host can't be trusted for that behind a proxy.
 */
export function siteOriginFromHtml(html: string): string | null {
  const url = /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html)?.[1];
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setMeta(
  html: string,
  attr: "name" | "property",
  key: string,
  value: string
): string {
  const pattern = new RegExp(
    `(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`,
    "i"
  );
  // Function replacement: a "$" in a title or description must not be read
  // as a capture-group reference.
  if (pattern.test(html)) {
    return html.replace(
      pattern,
      (_match, open: string, close: string) =>
        `${open}${escapeAttribute(value)}${close}`
    );
  }
  // Tag absent from the shell: add it rather than silently dropping the value.
  return html.replace(
    /<\/head>/i,
    `  <meta ${attr}="${key}" content="${escapeAttribute(value)}" />\n  </head>`
  );
}

/**
 * Rewrites the shell's head for one article. Leaves the rest of the document
 * — including the site-wide JSON-LD — untouched.
 */
export function injectArticleOgMeta(
  html: string,
  entry: ArticleOgEntry,
  origin: string | null
): string {
  const imageUrl = origin ? `${origin}${entry.image}` : entry.image;
  const pageUrl = origin ? `${origin}/ressources/${entry.slug}` : "";

  let out = html.replace(
    /<title>[^<]*<\/title>/i,
    () => `<title>${escapeAttribute(entry.title)}</title>`
  );

  out = setMeta(out, "name", "description", entry.description);
  out = setMeta(out, "property", "og:type", "article");
  out = setMeta(out, "property", "og:title", entry.title);
  out = setMeta(out, "property", "og:description", entry.description);
  out = setMeta(out, "property", "og:image", imageUrl);
  out = setMeta(out, "property", "og:image:alt", entry.imageAlt);
  out = setMeta(out, "name", "twitter:title", entry.title);
  out = setMeta(out, "name", "twitter:description", entry.description);
  out = setMeta(out, "name", "twitter:image", imageUrl);

  if (pageUrl) {
    out = setMeta(out, "property", "og:url", pageUrl);
    out = out.replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
      (_match, open: string, close: string) =>
        `${open}${escapeAttribute(pageUrl)}${close}`
    );
  }

  return out;
}
