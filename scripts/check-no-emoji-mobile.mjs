#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const MOBILE = join(ROOT, "apps/mobile");
const ALLOWED = new Set(["apps/mobile/src/lib/icon-for.ts"]);
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
