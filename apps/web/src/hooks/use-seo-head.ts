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

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
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
 * Sets SEO head tags for the current page. Cleans up JSON-LD on unmount.
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
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", "Tokō", "property");
    setMeta("og:locale", "fr_FR", "property");

    const imgUrl = toAbsoluteUrl(image ?? DEFAULT_OG_IMAGE);
    setMeta("og:image", imgUrl, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", imgUrl);

    const url = canonical ?? (typeof window !== "undefined" ? window.location.href : "");
    if (url) {
      setCanonical(url);
      setMeta("og:url", url, "property");
    }

    const scripts: HTMLScriptElement[] = [];

    if (jsonLd) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.text = JSON.stringify(jsonLd);
      s.dataset.seo = "article";
      document.head.appendChild(s);
      scripts.push(s);
    }

    if (faqJsonLd && faqJsonLd.length > 0) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqJsonLd.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      });
      s.dataset.seo = "faq";
      document.head.appendChild(s);
      scripts.push(s);
    }

    return () => {
      for (const s of scripts) {
        if (s.parentNode) s.parentNode.removeChild(s);
      }
    };
  }, [title, description, canonical, image, ogType, jsonLd, faqJsonLd]);
}
