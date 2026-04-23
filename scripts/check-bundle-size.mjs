#!/usr/bin/env node
// Business rule B11: LCP < 2.5s on 4G requires a disciplined JS budget.
// Runs after `pnpm build` in the web app. Walks `apps/web/dist/assets/`,
// gzip-encodes each .js file, and fails if the combined initial JS
// payload exceeds the budget. The index.html is parsed to distinguish
// "initial" scripts (listed in <script type=module src=…>) from lazy
// chunks (imported on demand by TanStack Router).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, join } from "node:path";

// Current initial payload is ~500 kB (mostly vendor: React + TanStack
// Router + Recharts). Budget set at the current ceiling — ratchet it
// down as chunks are split out (Recharts and jsPDF are the next two
// lazy-load candidates).
const BUDGET_BYTES = 550 * 1024;

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const DIST = join(ROOT, "apps/web/dist");
const ASSETS = join(DIST, "assets");

if (!statSync(DIST, { throwIfNoEntry: false })) {
  console.error("apps/web/dist not found — run `pnpm --filter @focusflow/web build` first.");
  process.exit(2);
}

const html = readFileSync(join(DIST, "index.html"), "utf-8");
const initialSrcs = Array.from(
  html.matchAll(/<script[^>]+src="([^"]+)"/g),
  (m) => m[1]
).map((src) => (src.startsWith("/") ? src.slice(1) : src));

if (initialSrcs.length === 0) {
  console.error("Could not find any <script src=…> in dist/index.html");
  process.exit(2);
}

function gzipSizeOf(path) {
  const buf = readFileSync(path);
  return gzipSync(buf, { level: 9 }).length;
}

let total = 0;
const breakdown = [];
for (const src of initialSrcs) {
  const path = join(DIST, src);
  if (!statSync(path, { throwIfNoEntry: false })) continue;
  const size = gzipSizeOf(path);
  total += size;
  breakdown.push({ src, bytes: size });
}

// Also count any CSS referenced from index.html — it blocks rendering.
const cssHrefs = Array.from(
  html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g),
  (m) => m[1]
).map((src) => (src.startsWith("/") ? src.slice(1) : src));

for (const href of cssHrefs) {
  const path = join(DIST, href);
  if (!statSync(path, { throwIfNoEntry: false })) continue;
  const size = gzipSizeOf(path);
  total += size;
  breakdown.push({ src: href, bytes: size });
}

const fmt = (n) => `${(n / 1024).toFixed(1)} kB`;

console.log(`Initial payload (gzip):`);
for (const b of breakdown) {
  console.log(`  ${fmt(b.bytes).padStart(9)}  ${b.src}`);
}
console.log(`  ${"─".repeat(20)}`);
console.log(`  ${fmt(total).padStart(9)}  total (budget ${fmt(BUDGET_BYTES)})`);

if (total > BUDGET_BYTES) {
  console.error(
    `\n❌ Initial bundle ${fmt(total)} exceeds the ${fmt(BUDGET_BYTES)} budget (rule B11).\n` +
      "   Split routes with React.lazy / TanStack Router, or defer heavy deps (Recharts, jsPDF).\n"
  );
  process.exit(1);
}

console.log(`\n✓ Initial bundle within budget (rule B11).`);

// Emit a breakdown of non-initial chunks so the CI log is useful.
const assets = readdirSync(ASSETS).filter((f) => f.endsWith(".js"));
const initialSet = new Set(breakdown.map((b) => b.src.replace(/^assets\//, "")));
const lazy = assets
  .filter((f) => !initialSet.has(`assets/${f}`))
  .map((f) => ({ f, bytes: gzipSizeOf(join(ASSETS, f)) }))
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 10);
if (lazy.length > 0) {
  console.log(`\nTop 10 lazy chunks (gzip):`);
  for (const l of lazy) {
    console.log(`  ${fmt(l.bytes).padStart(9)}  ${l.f}`);
  }
}
