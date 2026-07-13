import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

interface GoatCounter {
  count: (opts?: {
    path?: string;
    title?: string;
    event?: boolean;
    referrer?: string;
  }) => void;
  no_onload?: boolean;
}

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

/**
 * Injects the self-hosted GoatCounter count.js if VITE_GOATCOUNTER_URL is
 * configured. The env var must be the data-goatcounter beacon URL — the
 * script URL is derived by swapping the trailing /count for /count.js so
 * both subdomain (toko-stats.example.com/count) and path-prefixed
 * (stats.example.com/toko/count) installs work without extra config.
 */
export function loadGoatCounter(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const endpoint = import.meta.env.VITE_GOATCOUNTER_URL;
  if (!endpoint) return;
  if (document.querySelector("script[data-goatcounter]")) return;

  const scriptUrl = endpoint.replace(/\/count$/, "/count.js");

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = scriptUrl;
  tag.setAttribute("data-goatcounter", endpoint);
  document.head.appendChild(tag);
}

/**
 * Re-emits a GoatCounter pageview on every TanStack Router navigation. The
 * count.js auto-tracks the initial load; SPA route changes need a manual
 * count() call or the dashboard only ever sees the entry page.
 */
export function useGoatCounterPageviews(): void {
  // Subscribe to pathname only — that's what changes on SPA navigation.
  // Read the live query/hash from window.location inside the effect so we
  // don't depend on TanStack Router field names that vary across versions.
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!window.goatcounter || typeof window.goatcounter.count !== "function")
      return;
    // Track the pathname only. The query string and hash can carry a child
    // UUID (e.g. ?child=<uuid>) or other personal identifiers, which must not
    // reach the analytics store (RGPD data minimisation). Landing-page UTM
    // attribution is unaffected — count.js captures the full entry URL on its
    // own initial auto-load; this manual call only fires on in-app navigation.
    window.goatcounter.count({
      path: pathname,
      title: document.title,
    });
  }, [pathname]);
}
