#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const DIST = join(ROOT, "apps/web/dist");
const FORBIDDEN = /(?![©®])[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3✓✔✗✘✕✖]/gu;

const KOE_ALLOWLIST = [
  'koe-text-2xl",children:"✓"',
  'koe-text-2xl",children:"✨"',
  'emoji:"🐞",title:',
  'emoji:"💡",title:',
  'emoji:"⬆",title:',
];
const KOE_CHUNK_MARKER = "koe-flex";

const LIBRARY_ALLOWLIST = ['children:"✔️"', '"Error preloading route! ☝️"'];

const MAPPING_CHUNK = /(^|\/)icon-for-[^/]+\.js$/;
const MAPPING_LITERAL = /"[^"\\]*"/g;

const TEMPLATE_CHUNK_MARKER = 'key:"morning-school"';

const templatesSource = readFileSync(join(ROOT, "packages/validators/src/routine-templates.ts"), "utf-8");
const templateSnippets = new Set(
  [...templatesSource.matchAll(/emoji:\s*"([^"]+)"/g)].map((m) => `emoji:"${m[1]}"`),
);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.(js|css|html|webmanifest|json|txt|svg|xml)$/.test(entry.name)) out.push(path);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error("apps/web/dist not found: run the web build first.");
  process.exit(1);
}

const files = walk(DIST);
const texts = new Map(files.map((f) => [relative(ROOT, f), readFileSync(f, "utf-8")]));
const problems = [];

function countOccurrences(text, snippet) {
  return text.split(snippet).length - 1;
}

function expectExactlyOne(label, snippets, scopeOf) {
  for (const snippet of snippets) {
    let total = 0;
    for (const [rel, text] of texts) if (scopeOf(rel, text)) total += countOccurrences(text, snippet);
    if (total !== 1) problems.push(`${label}: expected exactly 1 occurrence of ${snippet}, found ${total}`);
  }
}

expectExactlyOne("Koe widget", KOE_ALLOWLIST, (_rel, text) => text.includes(KOE_CHUNK_MARKER));
expectExactlyOne("Library default", LIBRARY_ALLOWLIST, () => true);

const expectedTemplateChunks = [...texts].filter(([, t]) => t.includes(TEMPLATE_CHUNK_MARKER)).length;
if (expectedTemplateChunks !== 1) {
  problems.push(`Routine templates: expected exactly 1 chunk bundling the templates, found ${expectedTemplateChunks}`);
}

const hasEmoji = (s) => {
  FORBIDDEN.lastIndex = 0;
  return FORBIDDEN.test(s);
};

for (const [rel, original] of texts) {
  let text = original;

  for (const snippet of LIBRARY_ALLOWLIST) text = text.split(snippet).join("");

  if (text.includes(KOE_CHUNK_MARKER)) {
    for (const snippet of KOE_ALLOWLIST) text = text.split(snippet).join("");
  }

  if (original.includes(TEMPLATE_CHUNK_MARKER)) {
    for (const snippet of templateSnippets) text = text.split(snippet).join("");
  }

  if (MAPPING_CHUNK.test(rel)) {
    text = text.replace(MAPPING_LITERAL, (literal) => {
      const inner = literal.slice(1, -1);
      return inner.length > 0 && !/[A-Za-z0-9 ]/.test(inner) && hasEmoji(inner) ? '""' : literal;
    });
  }

  const found = text.match(FORBIDDEN) ?? [];
  if (found.length) problems.push(`${rel}: ${[...new Set(found)].join(" ")}`);
}

if (problems.length) {
  console.error(`Emoji guard on the built web bundle (${problems.length} problem${problems.length > 1 ? "s" : ""}):`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "Allowlist: exact Koe widget snippets (temporary, remove when @wifsimster/koe drops its emojis), two exact library defaults, routine template literals in the chunk bundling them, and bare emoji literals in the icon-for-* mapping chunk. Build with VITE_KOE_API_URL and VITE_KOE_PROJECT_KEY set, as release does.",
  );
  process.exit(1);
}
console.log(`No stray emoji in apps/web/dist (${files.length} files checked).`);
