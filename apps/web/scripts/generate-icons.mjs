import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { TEAL } from "./lib/brand.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
const mobileAssets = resolve(here, "..", "..", "mobile", "assets");

const INK = "#1E2A2E";
const SIDE = 512;

const master = readFileSync(resolve(publicDir, "icon.svg"), "utf8");
const favicon = readFileSync(resolve(publicDir, "favicon.svg"), "utf8");

const tileMatch = master.match(/<rect id="tuile"[^>]*\/>/);
if (!tileMatch) throw new Error('public/icon.svg: missing <rect id="tuile" …/>');
const art = master.slice(tileMatch.index + tileMatch[0].length, master.lastIndexOf("</svg>"));

const ART_CENTER_Y = 270;
const ART_RADIUS = 213;

function framed(radius, body = art) {
  const s = Math.round((radius / ART_RADIUS) * 1000) / 1000;
  return `<g transform="translate(${SIDE / 2} ${SIDE / 2}) scale(${s}) translate(${-SIDE / 2} ${-ART_CENTER_Y})">${body}</g>`;
}

function svg(content, background = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIDE} ${SIDE}">${background}${content}</svg>`;
}

function monochrome(body) {
  const mask = body
    .replace(/fill="#(?!1E2A2E)[0-9A-Fa-f]{6}"/g, 'fill="#000000"')
    .replaceAll(INK, "#FFFFFF");
  return `<mask id="encre" maskUnits="userSpaceOnUse" x="0" y="0" width="${SIDE}" height="${SIDE}">${mask}</mask>
  <rect width="${SIDE}" height="${SIDE}" fill="#FFFFFF" mask="url(#encre)"/>`;
}

const ADAPTIVE_RADIUS = (SIDE * 33) / 108 - 2;
const MASKABLE_RADIUS = SIDE * 0.4 - 4;

const fullBleed = svg(framed(MASKABLE_RADIUS), `<rect width="${SIDE}" height="${SIDE}" fill="${TEAL}"/>`);
const adaptive = svg(framed(ADAPTIVE_RADIUS));
const mono = svg(monochrome(framed(ADAPTIVE_RADIUS)));
const splash = svg(framed(ADAPTIVE_RADIUS, art.replace(/(<ellipse id="ombre"[^>]*fill=")#[0-9A-Fa-f]{6}/, "$1#E6DDCB")));

const targets = [
  [resolve(publicDir, "apple-touch-icon.png"), fullBleed, 180],
  [resolve(publicDir, "icon-192.png"), fullBleed, 192],
  [resolve(publicDir, "icon-512.png"), fullBleed, 512],
  [resolve(mobileAssets, "icon.png"), master, 1024],
  [resolve(mobileAssets, "adaptive-icon.png"), adaptive, 1024],
  [resolve(mobileAssets, "monochrome-icon.png"), mono, 1024],
  [resolve(mobileAssets, "splash-icon-light.png"), splash, 1024],
  [resolve(mobileAssets, "favicon.png"), favicon, 48],
];

for (const [path, source, size] of targets) {
  const resvg = new Resvg(source, { fitTo: { mode: "width", value: size } });
  writeFileSync(path, resvg.render().asPng());
  console.log(`generated ${path.slice(resolve(here, "..", "..").length + 1)} (${size}x${size})`);
}
