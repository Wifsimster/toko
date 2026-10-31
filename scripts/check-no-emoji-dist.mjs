#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const DIST = join(ROOT, "apps/web/dist");
const FORBIDDEN = /(?![©®])[\p{Extended_Pictographic}\p{Regional_Indicator}⃣✓✔✗✘✕✖]/gu;

const MAPPING_CHUNK = /(^|\/)icon-for-[^/]+\.js$/;
const LIBRARY_DEFAULTS = ['children:"✔️"', "Error preloading route! ☝️"];

const templates = readFileSync(join(ROOT, "packages/validators/src/routine-templates.ts"), "utf-8");
const templateEmoji = new Set(
  [...templates.matchAll(/emoji:\s*"([^"]+)"/g)].flatMap((m) => m[1].match(FORBIDDEN) ?? []),
);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.(js|css|html|webmanifest|json)$/.test(entry.name)) out.push(path);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error("apps/web/dist not found: run the web build first.");
  process.exit(1);
}

const files = walk(DIST);
const hits = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  if (MAPPING_CHUNK.test(rel)) continue;
  let text = readFileSync(file, "utf-8");
  for (const known of LIBRARY_DEFAULTS) text = text.split(known).join("");
  const found = (text.match(FORBIDDEN) ?? []).filter((c) => !templateEmoji.has(c));
  if (found.length) hits.push(`${rel}: ${[...new Set(found)].join(" ")}`);
}

if (hits.length) {
  console.error(`Emoji in the built web bundle (${hits.length} file${hits.length > 1 ? "s" : ""}):`);
  for (const h of hits) console.error(`  ${h}`);
  console.error(
    "Allowed: the icon-for-* mapping chunk, routine template glyphs from packages/validators (rendered through ItemIcon), and two known library defaults. Anything else comes from a dependency or an unguarded source: replace it with a lucide icon or a Mō drawing.",
  );
  process.exit(1);
}
console.log(`No stray emoji in apps/web/dist (${files.length} files checked).`);
