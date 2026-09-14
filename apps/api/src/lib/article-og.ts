// Share previews (Open Graph) for the SPA shell.
//
// Facebook, WhatsApp, LinkedIn, Slack and X read the HTML they get and never
// run the app's JavaScript, so the <meta> tags the React page sets are
// invisible to them: every shared resource link would otherwise show the
// generic Tokō card. Here the SPA fallback rewrites the head of index.html
// with that page's own title, description and image.
//
// Two manifests, both produced by the web app and shipped in the frontend
// bundle, so this file never needs to know the page or article list:
//   - og/articles.json (`pnpm --filter @focusflow/web og:articles`) keyed by
//     article slug, for /ressources/<slug>;
//   - og/pages.json (`… og:pages`) keyed by pathname, for the resource pages
//     around them — the hub /ressources, the lexicon, the crisis plan.

import fs from "node:fs";
import path from "node:path";

export interface ArticleOgEntry {
  slug: string;
  title: string;
  description: string;
  /** Root-relative path of the 1200x630 card, e.g. `/og/mon-article.png`. */
  image: string;
  imageAlt: string;
  /** Digest of the card's bytes, appended as `?v=` to bust scraper caches. */
  imageVersion?: string;
  /** Article subject, e.g. "Connaissance TDAH" — Facebook's article:section. */
  section?: string;
  /** ISO 8601 timestamps for article:published_time / article:modified_time. */
  publishedAt?: string;
  modifiedAt?: string;
}

export interface PageOgEntry {
  /** Root-relative pathname of the page, e.g. `/ressources`. */
  path: string;
  title: string;
  description: string;
  /** Root-relative path of the 1200x630 card, e.g. `/og/pages/x.png`. */
  image: string;
  imageAlt: string;
  /** Digest of the card's bytes, appended as `?v=` to bust scraper caches. */
  imageVersion?: string;
}

const MANIFEST_RELATIVE_PATH = path.join("og", "articles.json");
const PAGE_MANIFEST_RELATIVE_PATH = path.join("og", "pages.json");

/**
 * `/ressources/mon-article` → `mon-article`. Ignores anything deeper.
 *
 * `/connaissances/<slug>` is the same article behind the app's sidebar, and
 * it is the URL a signed-in parent copies out of the address bar to share.
 * It resolves to the same card, with og:url pointing at the public
 * `/ressources/<slug>` — so Facebook attributes the story to the public
 * page and the people who click it land on the article rather than on a
 * login screen.
 */
export function articleSlugFromPath(pathname: string): string | null {
  const match = /^\/(?:ressources|connaissances)\/([a-z0-9-]+)\/?$/i.exec(
    pathname
  );
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
 * The manifest key for a request path: trailing slash dropped, lowercased.
 * `/Ressources/` and `/ressources` are the same page to a crawler, and a
 * link pasted into Messenger often carries the trailing slash.
 */
export function pageOgKeyFromPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return (trimmed || "/").toLowerCase();
}

/**
 * Reads the standalone-page manifest. Like the article one, a missing file
 * is not an error: those pages then keep the default card.
 */
export function loadPageOgManifest(
  frontendPath: string
): Map<string, PageOgEntry> {
  const manifestPath = path.join(frontendPath, PAGE_MANIFEST_RELATIVE_PATH);
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    if (!Array.isArray(parsed)) throw new Error("expected an array");
    const entries = parsed as PageOgEntry[];
    return new Map(
      entries.map((entry) => [pageOgKeyFromPath(entry.path), entry])
    );
  } catch (error) {
    console.warn(
      `[og] no per-page share previews (${manifestPath}): ${
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
 * Rewrites the parts of the shell's head every share preview needs: title,
 * description, the card image and the canonical URL. Leaves the rest of the
 * document — including the site-wide JSON-LD — untouched.
 */
function injectShareMeta(
  html: string,
  entry: {
    title: string;
    description: string;
    image: string;
    imageVersion?: string;
    imageAlt: string;
  },
  origin: string | null,
  { type, pageUrl }: { type: "article" | "website"; pageUrl: string }
): string {
  const version = entry.imageVersion ? `?v=${entry.imageVersion}` : "";
  const imageUrl = `${origin ?? ""}${entry.image}${version}`;

  let out = html.replace(
    /<title>[^<]*<\/title>/i,
    () => `<title>${escapeAttribute(entry.title)}</title>`
  );

  out = setMeta(out, "name", "description", entry.description);
  out = setMeta(out, "property", "og:type", type);
  out = setMeta(out, "property", "og:title", entry.title);
  out = setMeta(out, "property", "og:description", entry.description);
  out = setMeta(out, "property", "og:image", imageUrl);
  // Facebook prefers og:image:secure_url when it is present. It only means
  // anything as an absolute https URL, so it is dropped when the shell had
  // no canonical origin to build one from.
  if (imageUrl.startsWith("https://")) {
    out = setMeta(out, "property", "og:image:secure_url", imageUrl);
  } else {
    out = out.replace(
      /\n\s*<meta property="og:image:secure_url" content="[^"]*" \/>/i,
      ""
    );
  }
  out = setMeta(out, "property", "og:image:alt", entry.imageAlt);

  out = setMeta(out, "name", "twitter:title", entry.title);
  out = setMeta(out, "name", "twitter:description", entry.description);
  out = setMeta(out, "name", "twitter:image", imageUrl);
  out = setMeta(out, "name", "twitter:image:alt", entry.imageAlt);

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

/**
 * Rewrites the shell's head for one article. Leaves the rest of the document
 * — including the site-wide JSON-LD — untouched.
 */
export function injectArticleOgMeta(
  html: string,
  entry: ArticleOgEntry,
  origin: string | null
): string {
  let out = injectShareMeta(html, entry, origin, {
    type: "article",
    pageUrl: origin ? `${origin}/ressources/${entry.slug}` : "",
  });

  // article:* is what Facebook reads off an og:type=article page; without
  // it the card carries no date and no subject.
  if (entry.section) {
    out = setMeta(out, "property", "article:section", entry.section);
  }
  if (entry.publishedAt) {
    out = setMeta(out, "property", "article:published_time", entry.publishedAt);
  }
  if (entry.modifiedAt) {
    out = setMeta(out, "property", "article:modified_time", entry.modifiedAt);
    out = setMeta(out, "property", "og:updated_time", entry.modifiedAt);
  }

  return out;
}

/** Rewrites the shell's head for one standalone resource page. */
export function injectPageOgMeta(
  html: string,
  entry: PageOgEntry,
  origin: string | null
): string {
  return injectShareMeta(html, entry, origin, {
    type: "website",
    pageUrl: origin ? `${origin}${entry.path}` : "",
  });
}
