#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const WEB = join(ROOT, "apps/web");
const FORBIDDEN = /(?![©®])[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3✓✔✗✘✕✖]/gu;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|js|jsx|mjs|json|css|html|webmanifest)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const files = [...walk(join(WEB, "src")), ...walk(join(WEB, "scripts")), join(WEB, "index.html")];
const hits = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  readFileSync(file, "utf-8")
    .split("\n")
    .forEach((line, i) => {
      const found = line.match(FORBIDDEN);
      if (found) hits.push(`${rel}:${i + 1}: ${[...new Set(found)].join(" ")}`);
    });
}

if (hits.length) {
  console.error(`No emoji in the web app (${hits.length} line${hits.length > 1 ? "s" : ""}):`);
  for (const h of hits) console.error(`  ${h}`);
  console.error(
    "Use a Mō drawing (components/mo) or a lucide-react icon (lib/item-icons.ts for stored icon values); write test fixtures as \\u{...} escapes.",
  );
  process.exit(1);
}
console.log(`No emoji in apps/web (${files.length} files checked).`);
