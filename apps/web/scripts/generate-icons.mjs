// Rasterizes the Tokō app icon (Mō on the teal tile) for the PWA, the iOS
// home screen and the Android app. iOS Safari ignores SVG apple-touch-icons
// and the web manifest needs PNG fallbacks, so we ship raster copies.
//
// Single source: public/icon.svg (same file as brand/toko-icon.svg). Its
// `id="tuile"` rect is the tile; everything after it is the Mō artwork. The
// script reframes that artwork for each target:
// - PWA / iOS PNGs: full-bleed teal (the OS applies its own mask), artwork
//   kept inside the 80 % maskable safe circle.
// - Android adaptive foreground and monochrome: transparent, artwork kept
//   inside the 66 dp safe circle of the 108 dp layer, so circle, squircle and
//   rounded-square masks never clip the macron or the arms.
// - Android splash: same framing on transparent (cream splash background),
//   with a cream-friendly ground shadow.
// Re-run `pnpm icons:generate` after editing public/icon.svg or favicon.svg.

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

// Optical centre of the artwork and the radius that encloses all of its ink
// (macron corners, arms, shadow), measured on public/icon.svg. Update both if
// the artwork moves, and the ground line (`GROUND`) of the Expo loader in
// apps/mobile/src/components/mo/mo-loader.tsx, which breathes from the splash
// image's shadow.
const ART_CENTER_Y = 270;
const ART_RADIUS = 213;

/** Artwork scaled about its centre so its ink fits in a circle of `radius`. */
function framed(radius, body = art) {
  const s = Math.round((radius / ART_RADIUS) * 1000) / 1000;
  return `<g transform="translate(${SIDE / 2} ${SIDE / 2}) scale(${s}) translate(${-SIDE / 2} ${-ART_CENTER_Y})">${body}</g>`;
}

function svg(content, background = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIDE} ${SIDE}">${background}${content}</svg>`;
}

// Monochrome (Android 13 themed icons): the system only keeps the alpha
// channel and tints it, so keep Mō's ink (outline, eyes, smile, macron
// outline) and drop the fills and the shadow. The artwork becomes a
// luminance mask (ink white, every fill black) so the body still hides the
// part of each arm drawn behind it.
function monochrome(body) {
  const mask = body
    .replace(/fill="#(?!1E2A2E)[0-9A-Fa-f]{6}"/g, 'fill="#000000"')
    .replaceAll(INK, "#FFFFFF");
  return `<mask id="encre" maskUnits="userSpaceOnUse" x="0" y="0" width="${SIDE}" height="${SIDE}">${mask}</mask>
  <rect width="${SIDE}" height="${SIDE}" fill="#FFFFFF" mask="url(#encre)"/>`;
}

// Android adaptive safe zone: a 66 dp circle in a 108 dp layer.
const ADAPTIVE_RADIUS = (SIDE * 33) / 108 - 2;
// PWA maskable safe zone: a circle of 80 % of the side.
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
