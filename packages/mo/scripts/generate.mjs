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
// des <text> de décor et un fondu (<defs> + <rect fill="url(#…)">). Les
// compagnons (svg/compagnons/) et les pictos enfant (svg/pictos/) sont des
// dessins plats ; `child.ts` les rassemble, sans import(), pour l'app Expo
// (et `parent.ts`, les états de Mō côté parent ; `mood.ts`, les visages du
// sélecteur d'humeur). Toute
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

// Ombre portée au sol : le premier tracé de chaque état.
const SHADOW_FILLS = new Set(["#E6DDCB"]);
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
  const rel = `mascotte/${file}`;
  const where = `svg/${rel}`;
  const { attrs, body } = svgRoot(readFileSync(join(SVG_DIR, rel), "utf-8"), where);
  const paths = elements(body, where).map((el) => {
    if (!el.startsWith("<path")) throw new Error(`${where} : seul <path> est permis dans un état de Mō.`);
    return readPath(el, where);
  });
  for (let i = 0; i < paths.length && SHADOW_FILLS.has(paths[i].fill); i++) {
    paths[i] = { ...paths[i], part: "shadow" };
  }
  const state = file.slice(3, -4).replace(/-petit$/, "");
  const art = { viewBox: attrs.viewBox, paths };
  if (WAVE_STATES.has(state)) markWave(art, where);
  if (MACRON_STATES.has(state)) markMacron(art, where);
  return art;
}

// Macron (le trait sarcelle au-dessus de la tête) des états qui ont un
// geste : « calme » (l'idée, mot de passe oublié) et « bravo » (le petit saut
// de confirmation). Isolé pour que le rendu le soulève sans toucher au reste.
const MACRON_STATES = new Set(["bravo", "calme"]);
const MACRON_FILL = "#3A8C93";

/**
 * Marque `part: "macron"` sur le macron et pose `art.ground`.
 *
 * Règle, mesurée sur les tracés :
 * - l'aplat du macron est le seul aplat sarcelle (`#3A8C93`), et sa boîte est
 *   entièrement au-dessus du corps (le plus grand aplat menthe) : il flotte ;
 * - il est suivi, sans rien d'autre entre les deux, de ses reflets (aplats non
 *   encre dont la boîte tient dans la sienne, version grande seulement) puis
 *   de son contour encre, dont la boîte contient la sienne ;
 * - le sol (pivot du corps) est le centre de l'ombre portée.
 * Toute autre configuration fait échouer la génération.
 */
function markMacron(art, where) {
  const { paths } = art;
  const teal = paths.flatMap((p, index) => (p.fill === MACRON_FILL ? [index] : []));
  if (teal.length !== 1) throw new Error(`${where} : ${teal.length} aplat(s) sarcelle trouvé(s), un macron attendu.`);
  const [first] = teal;
  const box = bbox(points(paths[first].d));
  const body = paths
    .filter((p) => p.fill === MO_BODY_FILL)
    .map((p) => bbox(points(p.d)))
    .reduce((a, b) => ((b.x1 - b.x0) * (b.y1 - b.y0) > (a.x1 - a.x0) * (a.y1 - a.y0) ? b : a));
  if (box.y1 >= body.y0) throw new Error(`${where} : le macron doit flotter au-dessus du corps.`);

  const within = (b, outer) => b.x0 >= outer.x0 && b.y0 >= outer.y0 && b.x1 <= outer.x1 && b.y1 <= outer.y1;
  let last = first + 1;
  while (paths[last] && paths[last].fill !== INK_FILL && within(bbox(points(paths[last].d)), box)) last++;
  const contour = paths[last];
  if (!contour || contour.fill !== INK_FILL || !within(box, bbox(points(contour.d)))) {
    throw new Error(`${where} : le macron n'est pas suivi de son contour encre.`);
  }

  const shadow = paths.find((p) => p.part === "shadow");
  if (!shadow) throw new Error(`${where} : pas d'ombre au sol pour poser le corps.`);
  const sbox = bbox(points(shadow.d));

  for (let i = first; i <= last; i++) paths[i] = { ...paths[i], part: "macron" };
  art.ground = [round1((sbox.x0 + sbox.x1) / 2), round1((sbox.y0 + sbox.y1) / 2)];
}

// Main qui salue (état « accueil ») : isolée pour que le rendu l'anime
// autour du poignet. Les SVG de la direction sont plats, sans groupe : on la
// retrouve par sa géométrie, pas par son rang (voir `markWave`).
const WAVE_STATES = new Set(["accueil"]);
const MO_BODY_FILL = "#D9EEE6";
const INK_FILL = "#1E2A2E";

function points(d) {
  const n = (d.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const out = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
}

function bbox(pts) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

const round1 = (v) => Math.round(v * 10) / 10;

/** Point dans un polygone fermé, par la règle pair-impair. */
function insidePolygon([x, y], pts) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/**
 * Marque `part: "wave"` sur la main levée et pose `art.wave`.
 *
 * Règle, mesurée sur les tracés (les SVG sources sont des M/L absolus) :
 * - le corps est le plus grand aplat menthe (`#D9EEE6`) ;
 * - la main levée est le seul autre aplat menthe dont le centre de la boîte
 *   englobante est au-dessus du centre du corps (pieds et bras posé sont
 *   dessous) ; elle est peinte avant le corps (elle passe derrière) et son
 *   contour est le tracé encre qui la suit, dont la boîte contient la sienne ;
 * - le poignet (pivot) est sur le grand axe du haricot (analyse en
 *   composantes principales de son aplat), au bout tourné vers le corps,
 *   avancé par pas de 0,5 jusqu'à entrer dans l'aplat du corps : la main
 *   tourne autour du point où elle s'attache et ne s'en détache pas ;
 * - le sol (pivot de l'inclinaison du corps) est le centre de l'ombre portée.
 * Toute autre configuration fait échouer la génération.
 */
function markWave(art, where) {
  const { paths } = art;
  const fills = paths
    .map((p, index) => ({ index, p, box: bbox(points(p.d)) }))
    .filter(({ p }) => p.fill === MO_BODY_FILL);
  const area = ({ box }) => (box.x1 - box.x0) * (box.y1 - box.y0);
  const body = fills.reduce((a, b) => (area(b) > area(a) ? b : a));
  const bodyCx = (body.box.x0 + body.box.x1) / 2;
  const bodyCy = (body.box.y0 + body.box.y1) / 2;
  const raised = fills.filter((f) => f !== body && (f.box.y0 + f.box.y1) / 2 < bodyCy);
  if (raised.length !== 1) throw new Error(`${where} : ${raised.length} main(s) levée(s) trouvée(s), une attendue.`);
  const [hand] = raised;
  if (hand.index > body.index) throw new Error(`${where} : la main levée doit passer derrière le corps.`);
  const contour = paths[hand.index + 1];
  const cbox = contour && bbox(points(contour.d));
  if (
    !contour ||
    contour.fill !== INK_FILL ||
    cbox.x0 > hand.box.x0 ||
    cbox.y0 > hand.box.y0 ||
    cbox.x1 < hand.box.x1 ||
    cbox.y1 < hand.box.y1
  ) {
    throw new Error(`${where} : la main levée n'est pas suivie de son contour encre.`);
  }

  const pts = points(hand.p.d);
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const [x, y] of pts) {
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
    sxy += (x - mx) * (y - my);
  }
  const angle = Math.atan2(2 * sxy, sxx - syy) / 2;
  let ax = Math.cos(angle);
  let ay = Math.sin(angle);
  // Grand axe orienté vers le corps.
  if (ax * (bodyCx - mx) + ay * (bodyCy - my) < 0) {
    ax = -ax;
    ay = -ay;
  }
  // Du bout de la main, on avance vers le corps jusqu'à entrer dans son
  // aplat : le poignet est sur le bord du corps, là où la main s'attache.
  let reach = Math.max(...pts.map(([x, y]) => (x - mx) * ax + (y - my) * ay));
  const bodyPts = points(body.p.d);
  for (let guard = 0; !insidePolygon([mx + ax * reach, my + ay * reach], bodyPts); guard++) {
    if (guard > 20) throw new Error(`${where} : la main levée ne touche pas le corps.`);
    reach += 0.5;
  }

  const shadow = paths.find((p) => p.part === "shadow");
  if (!shadow) throw new Error(`${where} : pas d'ombre au sol pour poser l'inclinaison.`);
  const sbox = bbox(points(shadow.d));

  for (const i of [hand.index, hand.index + 1]) paths[i] = { ...paths[i], part: "wave" };
  art.wave = {
    pivot: [round1(mx + ax * reach), round1(my + ay * reach)],
    ground: [round1((sbox.x0 + sbox.x1) / 2), round1((sbox.y0 + sbox.y1) / 2)],
  };
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
      if (!placement) {
        // Variante de pose propre à la scène (ex. « C'est parti » : macron
        // rapproché de la tête). Même nombre de tracés qu'un état, au plus
        // un sur cinq qui diffère : on garde l'état et on note les tracés
        // remplacés.
        for (const { state, size, art } of arts) {
          if (art.paths.length !== inner.length) continue;
          const changed = inner
            .map((p, index) => ({ index, path: { ...p, ...(art.paths[index].part ? { part: art.paths[index].part } : {}) } }))
            .filter(({ index }) => inner[index].d !== art.paths[index].d || inner[index].fill !== art.paths[index].fill);
          if (changed.length > 0 && changed.length * 5 <= inner.length) {
            placement = { state, size, shadow: true, poseOverrides: changed };
            break;
          }
        }
      }
      if (!placement) throw new Error(`${where} : le groupe <g> ne correspond à aucun état de Mō.`);
      const { poseOverrides, ...rest } = placement;
      layers.push({
        kind: "mo",
        ...rest,
        x: Number(t[1]),
        y: Number(t[2]),
        scale: Number(t[3]),
        ...(poseOverrides ? { poseOverrides } : {}),
      });
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

/** Un dessin plat (pictogramme, compagnon) : un <svg viewBox> et des <path>, rien d'autre. */
function readFlat(dir, file) {
  const where = `svg/${dir}/${file}`;
  const { attrs, body } = svgRoot(readFileSync(join(SVG_DIR, dir, file), "utf-8"), where);
  const paths = elements(body, where).map((el) => {
    if (!el.startsWith("<path")) throw new Error(`${where} : seul <path> est permis dans un dessin plat.`);
    return readPath(el, where);
  });
  return { viewBox: attrs.viewBox, paths };
}

const readIcon = (file) => readFlat("icons", file);

// Compagnons côté enfant : `<id>.svg` et ses variantes, suffixe → nom de variante.
const COMPANION_SUFFIXES = [
  ["-oeuf-petit", "egg-small"],
  ["-verrouille", "locked"],
  ["-petit", "small"],
  ["-oeuf", "egg"],
  ["", "large"],
];
const COMPANION_VARIANTS = ["large", "small", "locked", "egg", "egg-small"];

// Côté enfant (DIRECTION.md, « Côté enfant ») : Mō n'y montre que des états
// positifs ou neutres, jamais la fatigue, le trop-plein ni l'inquiétude.
const CHILD_STATES = ["accueil", "bravo", "calme", "guide", "veille"];
const CHILD_COMPANION_VARIANTS = ["large", "small", "locked"];

// Côté parent dans l'app Expo (états vides, conseils, fins d'étape) : les
// états que Mō peut montrer de sa propre initiative (`MO_NEUTRAL_STATES` sans
// « veille », propre à l'enfant). Jamais les états de reflet (fatigue,
// trop-plein, inquiétude) : ceux-là passent par `mood.ts`, le sélecteur d'humeur.
const PARENT_STATES = ["accueil", "bravo", "calme", "concentration", "fierte", "guide", "marche"];

// Sélecteur d'humeur de l'app Expo (accueil, point du soir) : la seule entrée
// qui porte les états de reflet, parce que le parent les choisit lui-même
// (DIRECTION.md, « sauf dans le sélecteur d'humeur »). Version petite
// seulement : les visages font 40 à 56 px.
const MOOD_STATES = ["fatigue", "trop-plein", "inquietude", "calme", "fierte"];

function companionFiles() {
  return readdirSync(join(SVG_DIR, "compagnons"))
    .filter((f) => f.endsWith(".svg"))
    .sort()
    .map((file) => {
      const base = file.slice(0, -4);
      const [suffix, variant] = COMPANION_SUFFIXES.find(([s]) => base.endsWith(s) && /^[a-z]+$/.test(base.slice(0, base.length - s.length)));
      return { file, id: base.slice(0, base.length - suffix.length), variant };
    });
}

// Pictos côté enfant : `<nom>.svg` (grand) et `<nom>-petit.svg`. Le fond du
// cadran n'existe qu'en grand et a son propre export.
const DIAL_BACKGROUND = "cadran-fond";

function pictoFiles() {
  return readdirSync(join(SVG_DIR, "pictos"))
    .filter((f) => f.endsWith(".svg") && f !== `${DIAL_BACKGROUND}.svg`)
    .sort()
    .map((file) => {
      const base = file.slice(0, -4);
      const small = base.endsWith("-petit");
      return { file, name: small ? base.slice(0, -"-petit".length) : base, size: small ? "small" : "large" };
    });
}

const artModule = (depth, art) =>
  `${HEADER}import type { MoArt } from "${"../".repeat(depth)}types";\n\nexport const art: MoArt = ${json(art)};\n`;

const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const json = (value) => JSON.stringify(value, null, 2);

/** Calcule tous les fichiers générés : Map<chemin relatif à src/generated, contenu>. */
export function build() {
  const files = new Map();
  // Clair seulement : Tokō n'a pas de mode sombre, les dessins de Mō sont
  // pensés pour le crème. La direction livre aussi mascotte/dark/, non importé.
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

  // Compagnons : un module par compagnon et par variante.
  const companions = companionFiles();
  const companionIds = [...new Set(companions.map((c) => c.id))].sort();
  for (const id of companionIds) {
    for (const variant of COMPANION_VARIANTS) {
      if (!companions.some((c) => c.id === id && c.variant === variant)) {
        throw new Error(`Compagnon ${id} : variante ${variant} manquante (5 fichiers par compagnon).`);
      }
    }
  }
  for (const { file, id, variant } of companions) {
    files.set(`companions/${id}-${variant}.ts`, artModule(2, readFlat("compagnons", file)));
  }
  const companionLoaders = companionIds
    .map(
      (id) =>
        `  ${json(id)}: {\n` +
        COMPANION_VARIANTS.map((v) => `    ${json(v)}: () => import("./companions/${id}-${v}").then((m) => m.art),\n`).join("") +
        `  },`,
    )
    .join("\n");
  files.set(
    "companions.ts",
    `${HEADER}import type { CompanionId, CompanionVariant, MoArt } from "../types";\n\n` +
      `export { COMPANION_IDS } from "./ids";\n\n` +
      `/** Un module par compagnon et par variante, chargé à la demande. */\n` +
      `export const companionArtLoaders: Record<CompanionId, Record<CompanionVariant, () => Promise<MoArt>>> = {\n${companionLoaders}\n};\n`,
  );

  // Pictos : un module par picto et par taille, plus le fond du cadran.
  const pictos = pictoFiles();
  const pictoNames = [...new Set(pictos.map((p) => p.name))].sort();
  for (const name of pictoNames) {
    for (const size of ["large", "small"]) {
      if (!pictos.some((p) => p.name === name && p.size === size)) {
        throw new Error(`Picto ${name}${size === "small" ? "-petit" : ""}.svg manquant : chaque picto a deux tailles.`);
      }
    }
  }
  for (const { file, name, size } of pictos) {
    files.set(`pictos/${name}-${size}.ts`, artModule(2, readFlat("pictos", file)));
  }
  files.set(`pictos/${DIAL_BACKGROUND}.ts`, artModule(2, readFlat("pictos", `${DIAL_BACKGROUND}.svg`)));
  const pictoLoaders = pictoNames
    .map(
      (name) =>
        `  ${json(name)}: {\n` +
        `    large: () => import("./pictos/${name}-large").then((m) => m.art),\n` +
        `    small: () => import("./pictos/${name}-small").then((m) => m.art),\n` +
        `  },`,
    )
    .join("\n");
  files.set(
    "pictos.ts",
    `${HEADER}import type { MoArt, MoSize, PictoName } from "../types";\n\n` +
      `export { PICTO_NAMES } from "./ids";\n\n` +
      `/** Un module par picto et par taille, chargé à la demande. */\n` +
      `export const pictoArtLoaders: Record<PictoName, Record<MoSize, () => Promise<MoArt>>> = {\n${pictoLoaders}\n};\n\n` +
      `/** Fond du cadran du minuteur (grand seulement) : l'arc reste dynamique par-dessus. */\n` +
      `export const loadDialBackgroundArt = (): Promise<MoArt> => import("./pictos/${DIAL_BACKGROUND}").then((m) => m.art);\n`,
  );

  // Listes d'ids sans chargeur : partagées par l'entrée web et l'entrée enfant.
  files.set(
    "ids.ts",
    `${HEADER}import type { CompanionId, PictoName } from "../types";\n\n` +
      `export const COMPANION_IDS = ${json(companionIds)} as const satisfies readonly CompanionId[];\n\n` +
      `export const PICTO_NAMES = ${json(pictoNames)} as const satisfies readonly PictoName[];\n`,
  );

  // Entrée synchrone de l'app Expo. Metro met tout ce qu'un `import()`
  // atteint dans le bundle natif : passer par les chargeurs ci-dessus y
  // mettrait les 44 dessins de Mō et les 100 de compagnons (≈ 4 Mo). Ici,
  // seulement ce que l'enfant voit : les états permis devant l'enfant, les
  // compagnons sans leurs œufs (option produit non retenue), les pictos.
  for (const state of CHILD_STATES) {
    if (!states.includes(state)) throw new Error(`État enfant inconnu : ${state}.`);
  }
  const imports = [];
  const ref = (path) => {
    const name = `a${imports.length}`;
    imports.push(`import { art as ${name} } from "./${path}";`);
    return name;
  };
  const childMo = CHILD_STATES.map(
    (s) =>
      `  ${json(s)}: {\n` +
      ["large", "small"]
        .map((z) => `    ${z}: ${ref(`art/${s}-${z}`)},\n`)
        .join("") +
      `  },`,
  ).join("\n");
  const childCompanions = companionIds
    .map((id) => `  ${json(id)}: { ${CHILD_COMPANION_VARIANTS.map((v) => `${json(v)}: ${ref(`companions/${id}-${v}`)}`).join(", ")} },`)
    .join("\n");
  const childPictos = pictoNames
    .map((name) => `  ${json(name)}: { large: ${ref(`pictos/${name}-large`)}, small: ${ref(`pictos/${name}-small`)} },`)
    .join("\n");
  const dial = ref(`pictos/${DIAL_BACKGROUND}`);
  files.set(
    "child.ts",
    `${HEADER}import type { CompanionId, MoArt, MoSize, MoState, PictoName } from "../types";\n` +
      `${imports.join("\n")}\n\n` +
      `/** Les seuls états de Mō montrés à l'enfant : positifs ou neutres. */\n` +
      `export const CHILD_MO_STATES = ${json(CHILD_STATES)} as const satisfies readonly MoState[];\n` +
      `export type ChildMoState = (typeof CHILD_MO_STATES)[number];\n\n` +
      `export const CHILD_COMPANION_VARIANTS = ${json(CHILD_COMPANION_VARIANTS)} as const;\n` +
      `export type ChildCompanionVariant = (typeof CHILD_COMPANION_VARIANTS)[number];\n\n` +
      `export const childMoArt: Record<ChildMoState, Record<MoSize, MoArt>> = {\n${childMo}\n};\n\n` +
      `export const companionArt: Record<CompanionId, Record<ChildCompanionVariant, MoArt>> = {\n${childCompanions}\n};\n\n` +
      `export const pictoArt: Record<PictoName, Record<MoSize, MoArt>> = {\n${childPictos}\n};\n\n` +
      `export const dialBackgroundArt: MoArt = ${dial};\n`,
  );

  // Entrée synchrone de l'app Expo, côté parent : mêmes raisons que
  // `child.ts` (pas d'`import()`), seulement les états de Mō, sans scènes,
  // compagnons ni pictos. Les modules communs avec `child.ts` (accueil,
  // bravo, calme, guide) sont les mêmes fichiers : Metro ne les compte qu'une fois.
  for (const state of PARENT_STATES) {
    if (!states.includes(state)) throw new Error(`État parent inconnu : ${state}.`);
  }
  const parentImports = [];
  const parentRef = (path) => {
    const name = `a${parentImports.length}`;
    parentImports.push(`import { art as ${name} } from "./${path}";`);
    return name;
  };
  const parentMo = PARENT_STATES.map(
    (s) =>
      `  ${json(s)}: {\n` +
      ["large", "small"].map((z) => `    ${z}: ${parentRef(`art/${s}-${z}`)},\n`).join("") +
      `  },`,
  ).join("\n");
  files.set(
    "parent.ts",
    `${HEADER}import type { MoArt, MoSize, MoState } from "../types";\n` +
      `${parentImports.join("\n")}\n\n` +
      `/** Les états de Mō côté parent dans l'app : jamais un état de reflet (fatigue, trop-plein, inquiétude). */\n` +
      `export const PARENT_MO_STATES = ${json(PARENT_STATES)} as const satisfies readonly MoState[];\n` +
      `export type ParentMoState = (typeof PARENT_MO_STATES)[number];\n\n` +
      `export const parentMoArt: Record<ParentMoState, Record<MoSize, MoArt>> = {\n${parentMo}\n};\n`,
  );

  // Entrée synchrone du sélecteur d'humeur (app Expo) : les cinq visages de
  // l'humeur du parent, en petit. Calme et fierté sont les mêmes modules que
  // `parent.ts` : Metro ne les compte qu'une fois.
  for (const state of MOOD_STATES) {
    if (!states.includes(state)) throw new Error(`État d'humeur inconnu : ${state}.`);
  }
  const moodImports = MOOD_STATES.map((s, i) => `import { art as a${i} } from "./art/${s}-small";`);
  const moodMo = MOOD_STATES.map((s, i) => `  ${json(s)}: a${i},`).join("\n");
  files.set(
    "mood.ts",
    `${HEADER}import type { MoArt, MoState } from "../types";\n` +
      `${moodImports.join("\n")}\n\n` +
      `/** Les visages du sélecteur d'humeur du parent : les seuls états de reflet de l'app, choisis par le parent. */\n` +
      `export const MOOD_MO_STATES = ${json(MOOD_STATES)} as const satisfies readonly MoState[];\n` +
      `export type MoodMoState = (typeof MOOD_MO_STATES)[number];\n\n` +
      `/** Version petite seulement (viewBox 6 18 188 188) : de 32 à 95 px. */\n` +
      `export const moodMoArt: Record<MoodMoState, MoArt> = {\n${moodMo}\n};\n`,
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
