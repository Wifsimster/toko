#!/usr/bin/env node
// Copie les sources SVG de la direction « Mō » dans `packages/mo/svg/`.
//
//   node packages/mo/scripts/import-direction.mjs <dossier de la direction>
//
// Le dossier de la direction (worktree `toko-da`) contient :
//   - mascotte/mo-<état>.svg et mo-<état>-petit.svg : copiés tels quels ;
//   - ecrans/0N-*.html : maquettes 390 × 844 dont on extrait, sans les
//     modifier, les SVG des scènes (décor + un <g transform> qui place Mō)
//     et les pictogrammes des objectifs.
//
// Ce script ne transforme rien : il isole des fichiers. `generate.mjs` lit
// ensuite `svg/` et écrit `src/generated/`. On ne relance l'import que quand
// la direction livre de nouveaux dessins ; le build n'en dépend pas.

import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const source = process.argv[2];
if (!source) {
  console.error(
    "Usage : node packages/mo/scripts/import-direction.mjs <dossier de la direction>\n" +
      "Exemple : node packages/mo/scripts/import-direction.mjs ../toko-da",
  );
  process.exit(2);
}

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const SVG = join(ROOT, "svg");
const DIRECTION = resolve(source);

// 1. Mascotte : copie à l'identique.
const mascotteOut = join(SVG, "mascotte");
mkdirSync(mascotteOut, { recursive: true });
const mascotteIn = join(DIRECTION, "mascotte");
const states = readdirSync(mascotteIn).filter((f) => /^mo-[a-z-]+\.svg$/.test(f));
for (const file of states) copyFileSync(join(mascotteIn, file), join(mascotteOut, file));

// 2. Scènes et pictogrammes : le n-ième <svg> d'une maquette (index compté
// dans l'ordre du document, barre d'état comprise). Si la direction change
// une maquette, vérifier ces index avant de relancer.
const PICKS = [
  { screen: "01-splash.html", index: 1, out: "scenes/splash.svg" },
  { screen: "01-splash.html", index: 2, out: "scenes/splash-fleche.svg" },
  { screen: "02-promesse.html", index: 1, out: "scenes/promesse.svg" },
  { screen: "05-mascotte.html", index: 2, out: "scenes/voici.svg" },
  { screen: "06-cest-parti.html", index: 2, out: "scenes/parti.svg" },
  { screen: "04-objectifs.html", index: 2, out: "icons/traits.svg" },
  { screen: "04-objectifs.html", index: 3, out: "icons/matins.svg" },
  { screen: "04-objectifs.html", index: 4, out: "icons/rendez-vous.svg" },
  { screen: "04-objectifs.html", index: 5, out: "icons/crises.svg" },
  { screen: "04-objectifs.html", index: 6, out: "icons/encourager.svg" },
  { screen: "04-objectifs.html", index: 7, out: "icons/couchers.svg" },
];

const cache = new Map();
for (const pick of PICKS) {
  if (!cache.has(pick.screen)) {
    const html = readFileSync(join(DIRECTION, "ecrans", pick.screen), "utf-8");
    cache.set(pick.screen, html.match(/<svg[\s\S]*?<\/svg>/g) ?? []);
  }
  const svg = cache.get(pick.screen)[pick.index];
  if (!svg) {
    console.error(`${pick.screen} : pas de <svg> n° ${pick.index}.`);
    process.exit(1);
  }
  const out = join(SVG, pick.out);
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, `${svg}\n`);
}

console.log(`${states.length} états de Mō et ${PICKS.length} scènes ou pictogrammes copiés dans ${SVG}.`);
