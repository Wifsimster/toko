import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description: string;
  canonical?: string;
  /** Absolute or root-relative URL of the share-preview image (1200x630). */
  image?: string;
  /** og:type — "website" for hubs, "article" for resource pages. */
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown>;
  faqJsonLd?: Array<{ question: string; answer: string }>;
}

const DEFAULT_OG_IMAGE = "/og-image.png";

/** Undoes a single head mutation, restoring whatever was there before. */
type Restore = () => void;

function setMeta(
  name: string,
  content: string,
  attr: "name" | "property" = "name",
): Restore {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${name}"]`,
  );
  if (existing) {
    const prev = existing.getAttribute("content");
    existing.setAttribute("content", content);
    return () => {
      if (prev === null) existing.removeAttribute("content");
      else existing.setAttribute("content", prev);
    };
  }
  const created = document.createElement("meta");
  created.setAttribute(attr, name);
  created.setAttribute("content", content);
  document.head.appendChild(created);
  return () => created.remove();
}

function setCanonical(href: string): Restore {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (existing) {
    const prev = existing.getAttribute("href");
    existing.setAttribute("href", href);
    return () => {
      if (prev === null) existing.removeAttribute("href");
      else existing.setAttribute("href", prev);
    };
  }
  const created = document.createElement("link");
  created.setAttribute("rel", "canonical");
  created.setAttribute("href", href);
  document.head.appendChild(created);
  return () => created.remove();
}

function addJsonLd(seo: string, data: unknown): Restore {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.text = JSON.stringify(data);
  s.dataset.seo = seo;
  document.head.appendChild(s);
  return () => s.remove();
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (typeof window === "undefined") return pathOrUrl;
  try {
    return new URL(pathOrUrl, window.location.origin).toString();
  } catch {
    return pathOrUrl;
  }
}

/**
 * Sets SEO head tags for the current page and restores the previous values
 * on unmount, so a route without useSeoHead (e.g. the authenticated app)
 * never inherits a public page's stale title, description or canonical.
 * Note: this is client-side; for real SEO indexing, prerendering or SSR
 * would be needed — Googlebot does render JS but with a budget penalty.
 */
export function useSeoHead({
  title,
  description,
  canonical,
  image,
  ogType = "website",
  jsonLd,
  faqJsonLd,
}: SeoOptions) {
  useEffect(() => {
    const restores: Restore[] = [];

    const prevTitle = document.title;
    document.title = title;
    restores.push(() => {
      document.title = prevTitle;
    });

    restores.push(setMeta("description", description));
    restores.push(setMeta("og:title", title, "property"));
    restores.push(setMeta("og:description", description, "property"));
    restores.push(setMeta("og:type", ogType, "property"));
    restores.push(setMeta("og:site_name", "Tokō", "property"));
    restores.push(setMeta("og:locale", "fr_FR", "property"));

    const imgUrl = toAbsoluteUrl(image ?? DEFAULT_OG_IMAGE);
    restores.push(setMeta("og:image", imgUrl, "property"));
    restores.push(setMeta("twitter:card", "summary_large_image"));
    restores.push(setMeta("twitter:title", title));
    restores.push(setMeta("twitter:description", description));
    restores.push(setMeta("twitter:image", imgUrl));

    const url =
      canonical ?? (typeof window !== "undefined" ? window.location.href : "");
    if (url) {
      restores.push(setCanonical(url));
      restores.push(setMeta("og:url", url, "property"));
    }

    if (jsonLd) {
      restores.push(addJsonLd("article", jsonLd));
    }

    if (faqJsonLd && faqJsonLd.length > 0) {
      restores.push(
        addJsonLd("faq", {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqJsonLd.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }),
      );
    }

    return () => {
      for (let i = restores.length - 1; i >= 0; i--) restores[i]?.();
    };
  }, [title, description, canonical, image, ogType, jsonLd, faqJsonLd]);
}
