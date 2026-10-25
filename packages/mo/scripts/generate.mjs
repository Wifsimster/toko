#!/usr/bin/env node
// Génère `src/generated/` à partir des SVG de `svg/` (voir import-direction.mjs).
//
//   pnpm --filter @focusflow/mo generate          # écrit les fichiers
//   pnpm --filter @focusflow/mo generate --check  # échoue si un fichier diffère
//
// Déterministe : mêmes SVG en entrée, mêmes octets en sortie (ordre des
// fichiers trié, aucune date). Le format d'entrée est volontairement étroit :
// <svg viewBox> avec des <path d fill [opacity|stroke|stroke-width]>, plus,
// pour les scènes, un <g transform="translate(x y) scale(s)"> qui place Mō,
// des <text> de décor et un fondu (<defs> + <rect fill="url(#…)">). Toute
// autre balise ou attribut fait échouer la génération plutôt que d'être
// ignoré en silence.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SVG_DIR = join(ROOT, "svg");
const OUT_DIR = join(ROOT, "src", "generated");

const HEADER =
  "// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.\n" +
  "// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.\n";

const SHADOW_FILL = "#E6DDCB";
const REPEATABLE = new Set(["L", "l", "C", "c", "Q", "q", "S", "s", "T", "t", "H", "h", "V", "v"]);

/**
 * Allège un attribut `d` sans changer la géométrie : nombres sans zéro
 * inutile (`181.0` → `181`) et commande répétée implicite (`L1 2L3 4` →
 * `L1 2 3 4`, valide en SVG pour toutes les commandes sauf M).
 */
export function compactPath(d) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  let out = "";
  let previousCommand = null;
  let lastWasCommand = false;
  for (const token of tokens) {
    if (/^[a-zA-Z]$/.test(token)) {
      if (token === previousCommand && REPEATABLE.has(token)) {
        lastWasCommand = false;
        continue;
      }
      out += token;
      previousCommand = /^[zZ]$/.test(token) ? null : token;
      lastWasCommand = true;
      continue;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error(`Nombre illisible dans un tracé : ${token}`);
    const formatted = String(Object.is(value, -0) ? 0 : value);
    if (!lastWasCommand && !formatted.startsWith("-")) out += " ";
    out += formatted;
    lastWasCommand = false;
  }
  return out;
}

function attributes(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
  return attrs;
}

const PATH_ATTRS = new Set(["d", "fill", "opacity", "stroke", "stroke-width"]);

function readPath(tag, where) {
  const attrs = attributes(tag);
  for (const key of Object.keys(attrs)) {
    if (!PATH_ATTRS.has(key)) throw new Error(`${where} : attribut <path ${key}> non pris en charge.`);
  }
  if (!attrs.d) throw new Error(`${where} : <path> sans d.`);
  const path = { d: compactPath(attrs.d) };
  if (attrs.fill !== undefined) path.fill = attrs.fill;
  if (attrs.stroke !== undefined) path.stroke = attrs.stroke;
  if (attrs["stroke-width"] !== undefined) path.strokeWidth = Number(attrs["stroke-width"]);
  if (attrs.opacity !== undefined) path.opacity = Number(attrs.opacity);
  return path;
}

function svgRoot(source, where) {
  const open = source.match(/^\s*<svg\b[^>]*>/);
  if (!open) throw new Error(`${where} : pas de balise <svg> en tête.`);
  const attrs = attributes(open[0]);
  if (!attrs.viewBox) throw new Error(`${where} : <svg> sans viewBox.`);
  const close = source.lastIndexOf("</svg>");
  return { attrs, body: source.slice(open[0].length, close) };
}

/** Découpe le corps d'un SVG en éléments de premier niveau, dans l'ordre. */
function elements(body, where) {
  const out = [];
  const re = /\s*(<path\b[^>]*\/>|<g\b[^>]*>[\s\S]*?<\/g>|<text\b[^>]*>[^<]*<\/text>|<defs>[\s\S]*?<\/defs>|<rect\b[^>]*\/>)/y;
  let index = 0;
  while (index < body.length) {
    if (/^\s*$/.test(body.slice(index))) break;
    re.lastIndex = index;
    const m = re.exec(body);
    if (!m) throw new Error(`${where} : élément non pris en charge près de « ${body.slice(index, index + 60).trim()} ».`);
    out.push(m[1]);
    index = re.lastIndex;
  }
  return out;
}

function readArt(file) {
  const where = `svg/mascotte/${file}`;
  const { attrs, body } = svgRoot(readFileSync(join(SVG_DIR, "mascotte", file), "utf-8"), where);
  const paths = elements(body, where).map((el) => {
    if (!el.startsWith("<path")) throw new Error(`${where} : seul <path> est permis dans un état de Mō.`);
    return readPath(el, where);
  });
  const shadow = paths.findIndex((p) => p.fill === SHADOW_FILL);
  if (shadow !== -1) paths[shadow] = { ...paths[shadow], part: "shadow" };
  return { viewBox: attrs.viewBox, paths };
}

function stateFiles() {
  return readdirSync(join(SVG_DIR, "mascotte"))
    .filter((f) => /^mo-[a-z-]+\.svg$/.test(f))
    .sort()
    .map((file) => {
      const base = file.slice(3, -4);
      const small = base.endsWith("-petit");
      return { file, state: small ? base.slice(0, -"-petit".length) : base, size: small ? "small" : "large" };
    });
}

function sameArt(paths, art) {
  return paths.length === art.paths.length && paths.every((p, i) => p.d === art.paths[i].d && p.fill === art.paths[i].fill);
}

function readScene(file, arts) {
  const where = `svg/scenes/${file}`;
  const { attrs, body } = svgRoot(readFileSync(join(SVG_DIR, "scenes", file), "utf-8"), where);
  const [, , width, height] = attrs.viewBox.split(/\s+/).map(Number);
  const layers = [];
  let fadeBottom;
  for (const el of elements(body, where)) {
    if (el.startsWith("<path")) {
      const last = layers[layers.length - 1];
      const path = readPath(el, where);
      if (last?.kind === "paths") last.paths.push(path);
      else layers.push({ kind: "paths", paths: [path] });
    } else if (el.startsWith("<g")) {
      const transform = attributes(el.match(/^<g\b[^>]*>/)[0]).transform ?? "";
      const t = transform.match(/^translate\(([-\d.]+)[ ,]+([-\d.]+)\)\s*scale\(([-\d.]+)\)$/);
      if (!t) throw new Error(`${where} : transform non pris en charge : ${transform}`);
      const inner = [...el.matchAll(/<path\b[^>]*\/>/g)].map((m) => readPath(m[0], where));
      let placement = null;
      for (const { state, size, art } of arts) {
        if (sameArt(inner, art)) placement = { state, size, shadow: true };
        else if (art.paths[0]?.part === "shadow" && sameArt(inner, { paths: art.paths.slice(1) })) {
          placement = { state, size, shadow: false };
        }
        if (placement) break;
      }
      if (!placement) throw new Error(`${where} : le groupe <g> ne correspond à aucun état de Mō.`);
      layers.push({ kind: "mo", ...placement, x: Number(t[1]), y: Number(t[2]), scale: Number(t[3]) });
    } else if (el.startsWith("<text")) {
      const a = attributes(el.match(/^<text\b[^>]*>/)[0]);
      if (a["font-family"] !== "Main") throw new Error(`${where} : police de <text> inconnue : ${a["font-family"]}`);
      layers.push({
        kind: "text",
        x: Number(a.x),
        y: Number(a.y),
        text: el.replace(/^<text\b[^>]*>/, "").replace(/<\/text>$/, ""),
        fontSize: Number(a["font-size"]),
        fontWeight: Number(a["font-weight"]),
        fill: a.fill,
        anchor: a["text-anchor"] ?? "start",
        font: "hand",
      });
    } else if (el.startsWith("<rect")) {
      const a = attributes(el);
      if (!/^url\(#/.test(a.fill ?? "") || Number(a.y) + Number(a.height) < height - 1) {
        throw new Error(`${where} : seul le fondu en bas de scène est permis comme <rect>.`);
      }
      fadeBottom = Number(a.height);
    }
    // <defs> : le dégradé du fondu, remplacé par `fadeBottom`.
  }
  const scene = { width, height, viewBox: attrs.viewBox, layers };
  if (fadeBottom !== undefined) scene.fadeBottom = fadeBottom;
  return scene;
}

function readIcon(file) {
  const where = `svg/icons/${file}`;
  const { attrs, body } = svgRoot(readFileSync(join(SVG_DIR, "icons", file), "utf-8"), where);
  const paths = elements(body, where).map((el) => {
    if (!el.startsWith("<path")) throw new Error(`${where} : seul <path> est permis dans un pictogramme.`);
    return readPath(el, where);
  });
  return { viewBox: attrs.viewBox, paths };
}

const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const json = (value) => JSON.stringify(value, null, 2);

/** Calcule tous les fichiers générés : Map<chemin relatif à src/generated, contenu>. */
export function build() {
  const files = new Map();
  const arts = stateFiles().map((entry) => ({ ...entry, art: readArt(entry.file) }));

  for (const { state, size, art } of arts) {
    files.set(
      `art/${state}-${size}.ts`,
      `${HEADER}import type { MoArt } from "../../types";\n\nexport const art: MoArt = ${json(art)};\n`,
    );
  }

  const states = [...new Set(arts.map((a) => a.state))].sort();
  for (const state of states) {
    for (const size of ["large", "small"]) {
      if (!arts.some((a) => a.state === state && a.size === size)) {
        throw new Error(`mo-${state}${size === "small" ? "-petit" : ""}.svg manque : chaque état a deux tailles.`);
      }
    }
  }
  const loaders = states
    .map(
      (s) =>
        `  ${json(s)}: {\n` +
        `    large: () => import("./art/${s}-large").then((m) => m.art),\n` +
        `    small: () => import("./art/${s}-small").then((m) => m.art),\n` +
        `  },`,
    )
    .join("\n");
  files.set(
    "states.ts",
    `${HEADER}import type { MoArt, MoSize, MoState } from "../types";\n\n` +
      `export const MO_STATES = ${json(states)} as const satisfies readonly MoState[];\n\n` +
      `/** Un module par état et par taille : le bundler ne charge que ce qui s'affiche. */\n` +
      `export const moArtLoaders: Record<MoState, Record<MoSize, () => Promise<MoArt>>> = {\n${loaders}\n};\n`,
  );

  const sceneFiles = readdirSync(join(SVG_DIR, "scenes")).filter((f) => f.endsWith(".svg")).sort();
  for (const file of sceneFiles) {
    const scene = readScene(file, arts);
    files.set(
      `scenes/${file.slice(0, -4)}.ts`,
      `${HEADER}import type { MoScene } from "../../types";\n\nexport const scene: MoScene = ${json(scene)};\n`,
    );
  }

  const iconFiles = readdirSync(join(SVG_DIR, "icons")).filter((f) => f.endsWith(".svg")).sort();
  const icons = iconFiles.map((f) => `  ${camel(f.slice(0, -4))}: ${json(readIcon(f)).replace(/\n/g, "\n  ")},`).join("\n");
  files.set(
    "icons.ts",
    `${HEADER}import type { MoIcon } from "../types";\n\nexport const icons = {\n${icons}\n} satisfies Record<string, MoIcon>;\n`,
  );

  return files;
}

function listFiles(dir, prefix = "") {
  let out = [];
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out = out.concat(listFiles(join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

/** Fichiers générés absents, en trop ou différents du disque. */
export function staleFiles(files = build()) {
  const stale = [];
  for (const [rel, content] of files) {
    let current = null;
    try {
      current = readFileSync(join(OUT_DIR, rel), "utf-8");
    } catch {
      // absent
    }
    if (current !== content) stale.push(rel);
  }
  for (const rel of listFiles(OUT_DIR)) if (!files.has(rel)) stale.push(rel);
  return stale.sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = build();
  if (process.argv.includes("--check")) {
    const stale = staleFiles(files);
    if (stale.length) {
      console.error(`src/generated n'est pas à jour (${stale.join(", ")}). Lancer : pnpm --filter @focusflow/mo generate`);
      process.exit(1);
    }
    console.log("src/generated est à jour.");
  } else {
    rmSync(OUT_DIR, { recursive: true, force: true });
    for (const [rel, content] of files) {
      mkdirSync(dirname(join(OUT_DIR, rel)), { recursive: true });
      writeFileSync(join(OUT_DIR, rel), content);
    }
    console.log(`${files.size} fichiers écrits dans ${OUT_DIR}.`);
  }
}
