#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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

const mascotteOut = join(SVG, "mascotte");
mkdirSync(mascotteOut, { recursive: true });
const mascotteIn = join(DIRECTION, "mascotte");
const states = readdirSync(mascotteIn).filter((f) => /^mo-[a-z-]+\.svg$/.test(f));
for (const file of states) copyFileSync(join(mascotteIn, file), join(mascotteOut, file));

const has = (dir) => existsSync(join(DIRECTION, dir));

let companions = [];
if (has("compagnons")) {
  const companionsOut = join(SVG, "compagnons");
  mkdirSync(companionsOut, { recursive: true });
  companions = readdirSync(join(DIRECTION, "compagnons")).filter((f) => /^[a-z]+(-[a-z]+)*\.svg$/.test(f));
  for (const file of companions) copyFileSync(join(DIRECTION, "compagnons", file), join(companionsOut, file));
}

let pictos = [];
if (has("pictos")) {
  const pictosOut = join(SVG, "pictos");
  mkdirSync(pictosOut, { recursive: true });
  pictos = readdirSync(join(DIRECTION, "pictos")).filter(
    (f) => /^[a-z0-9-]+\.svg$/.test(f) && !/^cadran-\d+\.svg$/.test(f),
  );
  for (const file of pictos) copyFileSync(join(DIRECTION, "pictos", file), join(pictosOut, file));
}

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
const picks = has("ecrans") ? PICKS : [];
for (const pick of picks) {
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

console.log(
  `${states.length} dessins de Mō, ${companions.length} compagnons, ` +
    `${pictos.length} pictos enfant et ${picks.length} scènes ou pictogrammes copiés dans ${SVG}.`,
);
