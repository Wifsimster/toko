#!/usr/bin/env node
// Business rule B7: no guilt-inducing language in user-facing copy.
// Scans the French i18n bundle for a small banned lexicon.
// Exits 1 on any match so CI fails fast.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BANNED = [
  // root -> variants (lower-cased comparison)
  "oubli",      // "oubli", "oublié", "oubliez"...
  "retard",     // "retard", "en retard", "retardataire"
  "raté",       // "raté", "ratée", "ratés"
  "rate",       // "vous ratez", "ne ratez pas" — single-word
  "échec",      // "échec", "échecs"
  "faute",      // "c'est votre faute"
  "nul",        // "c'est nul" (standalone only — guarded by word boundary)
];

// Keys whose values are generated pseudo-random or test strings and should
// not trigger the lexicon check (e.g. debug strings, id prefixes).
const IGNORED_KEY_PATHS = new Set([
  // Stripe billing state label — not parent-child copy
  "account.pastDue",
]);

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const FR_FILE = resolve(ROOT, "apps/web/src/lib/i18n/locales/fr.json");

const bundle = JSON.parse(readFileSync(FR_FILE, "utf-8"));

const hits = [];

function scan(value, path) {
  if (typeof value === "string") {
    if (IGNORED_KEY_PATHS.has(path)) return;
    // Strip i18next placeholders ({{foo}}, {foo}) so template variable names
    // like "rate" or "token" are not scanned as French words.
    const lower = value
      .toLowerCase()
      .replace(/\{\{[^}]+\}\}/g, "")
      .replace(/\{[^}]+\}/g, "");
    for (const word of BANNED) {
      // word-boundary match so "literature" doesn't trigger on "rate", etc.
      const re = new RegExp(`\\b${word}\\w*`, "u");
      if (re.test(lower)) {
        hits.push({ path, word, value });
        break;
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scan(v, `${path}[${i}]`));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      scan(v, path ? `${path}.${k}` : k);
    }
  }
}

scan(bundle, "");

if (hits.length > 0) {
  console.error(`\n❌ Guilt lexicon violations (rule B7) — ${hits.length} found:\n`);
  for (const h of hits) {
    console.error(`  ${h.path}`);
    console.error(`    banned word: "${h.word}"`);
    console.error(`    value: ${JSON.stringify(h.value)}\n`);
  }
  console.error(
    "Fix: reformulate as an opportunity, never as a reminder of failure."
  );
  console.error(
    "If the match is a genuine false positive, add the key path to IGNORED_KEY_PATHS in scripts/check-guilt-lexicon.mjs."
  );
  process.exit(1);
}

console.log(`✓ No guilt lexicon found in fr.json (rule B7)`);
