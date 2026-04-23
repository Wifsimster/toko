#!/usr/bin/env node
// Business rules C5 (no third-party trackers) + F6 (self-host analytics).
// Fails if a known tracker domain or advertising script appears in any
// frontend source file. Run in CI before the build.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const BANNED_PATTERNS = [
  // Analytics
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /\bgtag\(/i,
  /\bga\(/i,
  /mixpanel\.com/i,
  /amplitude\.com/i,
  /app\.posthog\.com/i,          // allow self-host, ban SaaS endpoint
  /api\.segment\.io/i,
  /snowplow\.com/i,
  /matomo\.cloud/i,              // allow self-host, ban SaaS endpoint
  // Advertising
  /doubleclick\.net/i,
  /google-ads\./i,
  /facebook\.net/i,
  /connect\.facebook\.net/i,
  /adservice\.google/i,
  // Session replay / heatmaps
  /hotjar\.com/i,
  /clarity\.ms/i,
  /fullstory\.com/i,
  /logrocket\.com/i,
];

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const SCAN_ROOTS = [
  join(ROOT, "apps/web/index.html"),
  join(ROOT, "apps/web/src"),
  join(ROOT, "apps/web/public"),
];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".json", ".css"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".turbo"]);

const hits = [];

function walk(path) {
  const info = statSync(path, { throwIfNoEntry: false });
  if (!info) return;
  if (info.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(join(path, entry));
    }
    return;
  }
  if (!EXTENSIONS.has(extname(path))) return;

  const content = readFileSync(path, "utf-8");
  for (const re of BANNED_PATTERNS) {
    const match = re.exec(content);
    if (match) {
      hits.push({ path: path.slice(ROOT.length + 1), match: match[0] });
    }
  }
}

for (const root of SCAN_ROOTS) walk(root);

if (hits.length > 0) {
  console.error(`\n❌ Third-party tracker detected (rules C5 / F6):\n`);
  for (const h of hits) {
    console.error(`  ${h.path} — "${h.match}"`);
  }
  console.error(
    "\nBusiness rule: no ads, no third-party trackers. Analytics must be self-hosted (PostHog or Matomo self-host, mode EU, no cookie)."
  );
  process.exit(1);
}

console.log("✓ No third-party trackers in frontend (rules C5 / F6)");
