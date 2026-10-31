#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const WEB = join(ROOT, "apps/web");
const FORBIDDEN = /(?![©®])[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3✓✔✗✘✕✖]/gu;

const ESCAPE = /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g;
const ESCAPE_EXEMPT = /(^|\/)(__tests__\/|[^/]+\.test\.[^/]+$)|packages\/mo\/src\/item-icons\.ts$/;

function decodeEscapes(line) {
  return line.replace(ESCAPE, (match, braced, short) => {
    const code = parseInt(braced ?? short, 16);
    if (code > 0x10ffff) return match;
    return braced ? String.fromCodePoint(code) : String.fromCharCode(code);
  });
}

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
  const checkEscapes = !ESCAPE_EXEMPT.test(rel);
  readFileSync(file, "utf-8")
    .split("\n")
    .forEach((line, i) => {
      const found = line.match(FORBIDDEN);
      if (found) {
        hits.push(`${rel}:${i + 1}: ${[...new Set(found)].join(" ")}`);
        return;
      }
      if (!checkEscapes) return;
      const decoded = decodeEscapes(line).match(FORBIDDEN);
      if (decoded) hits.push(`${rel}:${i + 1}: escaped ${[...new Set(decoded)].join(" ")}`);
    });
}

if (hits.length) {
  console.error(`No emoji in the web app (${hits.length} line${hits.length > 1 ? "s" : ""}):`);
  for (const h of hits) console.error(`  ${h}`);
  console.error(
    "Use a Mō drawing (components/mo) or a lucide-react icon (lib/item-icons.ts for stored icon values); keep \\u{...} escapes for fixtures in test files only.",
  );
  process.exit(1);
}
console.log(`No emoji in apps/web (${files.length} files checked).`);
