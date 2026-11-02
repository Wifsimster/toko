import { describe, it, expect } from "vitest";
import { isStaticAssetPath, staticCacheControl } from "../lib/static-assets";

describe("isStaticAssetPath", () => {
  it("claims hashed build output so a stale client gets a 404, not index.html", () => {
    expect(isStaticAssetPath("/assets/index-OLDHASH.js")).toBe(true);
    expect(isStaticAssetPath("/assets/index-CtLQ5UnG.css")).toBe(true);
    expect(isStaticAssetPath("/assets/Trans-BwpR2pTw.js")).toBe(true);
  });

  it("claims root-level static files emitted outside /assets", () => {
    for (const p of [
      "/sw.js",
      "/push-sw.js",
      "/workbox-7aa7b2c2.js",
      "/manifest.webmanifest.json",
      "/favicon.svg",
      "/icon.png",
      "/robots.txt",
      "/fonts/inter.woff2",
    ]) {
      expect(isStaticAssetPath(p), p).toBe(true);
    }
  });

  it("leaves navigation routes to the SPA fallback", () => {
    for (const p of [
      "/",
      "/dashboard",
      "/login",
      "/suivi",
      "/connaissances/crise-tdah-enfant-guide-complet",
      "/routines",
    ]) {
      expect(isStaticAssetPath(p), p).toBe(false);
    }
  });

  it("does not mistake a dot inside a route segment for an extension", () => {
    expect(isStaticAssetPath("/connaissances/tdah-6.ans")).toBe(false);
  });
});

describe("staticCacheControl", () => {
  it("caches hashed assets forever", () => {
    expect(staticCacheControl("/assets/index-CtLQ5UnG.js")).toBe(
      "public, max-age=31536000, immutable"
    );
  });

  it("forces revalidation of the files that announce a release", () => {
    for (const p of [
      "/index.html",
      "/sw.js",
      "/push-sw.js",
      "/registerSW.js",
      "/workbox-7aa7b2c2.js",
      "/manifest.webmanifest",
    ]) {
      expect(staticCacheControl(p), p).toBe("no-cache");
    }
  });

  it("leaves other files to the default", () => {
    expect(staticCacheControl("/favicon.svg")).toBeNull();
  });
});
