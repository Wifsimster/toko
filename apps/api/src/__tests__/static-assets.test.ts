import { describe, it, expect } from "vitest";
import { isStaticAssetPath } from "../lib/static-assets";

describe("isStaticAssetPath", () => {
  it("claims hashed build output so a stale client gets a 404, not index.html", () => {
    // The regression: a browser on a previous build asks for a chunk whose
    // hash is gone. Served index.html, the dynamic import rejects and every
    // code-split route renders blank.
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
