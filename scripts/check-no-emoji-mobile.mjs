#!/usr/bin/env node
// Rule (2026-10-26): no generic emoji anywhere in the Tokō app UI. The Expo
// app shows Mō drawings (packages/mo) and, for pure UI controls, lucide icons.
// Fails if apps/mobile/src (or App.tsx) contains an Extended_Pictographic
// character, a flag, a keycap or a text check/cross mark (✓ ✔ ✗ ✘ ✕ ✖),
// outside the one file that maps stored emoji to drawings (lib/icon-for.ts,
// lookup keys only).
// Run by `pnpm lint:copy`, so CI checks it on every PR.

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const MOBILE = join(ROOT, "apps/mobile");
const ALLOWED = new Set(["apps/mobile/src/lib/icon-for.ts"]);
// U+00A9 © and U+00AE ® are Extended_Pictographic but ordinary typography.
// Flags (regional indicator pairs) and keycaps (U+20E3) are emoji too but not
// Extended_Pictographic, so they are listed explicitly.
const FORBIDDEN = /(?![©®])[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3✓✔✗✘✕✖]/gu;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const files = [...walk(join(MOBILE, "src")), join(MOBILE, "App.tsx")];
const hits = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  if (ALLOWED.has(rel)) continue;
  readFileSync(file, "utf-8")
    .split("\n")
    .forEach((line, i) => {
      const found = line.match(FORBIDDEN);
      if (found) hits.push(`${rel}:${i + 1}: ${[...new Set(found)].join(" ")}`);
    });
}

if (hits.length) {
  console.error(`No generic emoji in the app (${hits.length} line${hits.length > 1 ? "s" : ""}):`);
  for (const h of hits) console.error(`  ${h}`);
  console.error(
    "Use a Mō drawing (components/item-icon.tsx, lib/icon-for.ts) or, for a UI control, a lucide-react-native icon.",
  );
  process.exit(1);
}
console.log(`No emoji in apps/mobile/src (${files.length} files checked).`);
