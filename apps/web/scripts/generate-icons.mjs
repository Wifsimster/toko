// Rasterizes the Tokō app icon to PNG for the PWA install prompt and the
// iOS home screen. iOS Safari ignores SVG apple-touch-icons, and the web
// manifest needs PNG fallbacks for broad install/splash support, so we ship
// raster copies. The raster icon is full-bleed (no rounded corners) so iOS
// and Android can apply their own masking cleanly.
// Re-run `pnpm icons:generate` after editing the mark or brand colors.

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { MARK_PATH, CREAM, TEAL } from "./lib/brand.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");

// Same mark and brand colors as public/icon.svg, but the teal fills the
// whole canvas instead of a rounded square. The mark spans 72 % of the side,
// which keeps it inside the 80 % maskable safe zone.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${TEAL}"/>
  <path transform="translate(71.68 71.68) scale(3.69)" d="${MARK_PATH}" fill="${CREAM}"/>
</svg>`;

const targets = [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

for (const [name, size] of targets) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  writeFileSync(resolve(publicDir, name), resvg.render().asPng());
  console.log(`generated ${name} (${size}x${size})`);
}
