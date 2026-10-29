import fs from "node:fs";
import path from "node:path";

export interface ArticleOgEntry {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageVersion?: string;
  section?: string;
  publishedAt?: string;
  modifiedAt?: string;
}

export interface PageOgEntry {
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageVersion?: string;
}

const MANIFEST_RELATIVE_PATH = path.join("og", "articles.json");
const PAGE_MANIFEST_RELATIVE_PATH = path.join("og", "pages.json");

export function articleSlugFromPath(pathname: string): string | null {
  const match = /^\/(?:ressources|connaissances)\/([a-z0-9-]+)\/?$/i.exec(
    pathname
  );
  return match?.[1] ?? null;
}

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

export function pageOgKeyFromPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return (trimmed || "/").toLowerCase();
}

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
  if (pattern.test(html)) {
    return html.replace(
      pattern,
      (_match, open: string, close: string) =>
        `${open}${escapeAttribute(value)}${close}`
    );
  }
  return html.replace(
    /<\/head>/i,
    `  <meta ${attr}="${key}" content="${escapeAttribute(value)}" />\n  </head>`
  );
}

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

export function injectArticleOgMeta(
  html: string,
  entry: ArticleOgEntry,
  origin: string | null
): string {
  let out = injectShareMeta(html, entry, origin, {
    type: "article",
    pageUrl: origin ? `${origin}/ressources/${entry.slug}` : "",
  });

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
