// Rasterizes the Tokō app icon to PNG for the PWA install prompt and the
// iOS home screen. iOS Safari ignores SVG apple-touch-icons, and the web
// manifest needs PNG fallbacks for broad install/splash support, so we ship
// raster copies. The raster icon is full-bleed (no rounded corners) so iOS
// and Android can apply their own masking cleanly.
// Re-run `pnpm icons:generate` after editing the heart path or brand colors.

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");

// Same heart path and brand colors as public/icon.svg, but the teal fills
// the whole canvas instead of a rounded square.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#358891"/>
  <path d="M256 380c-8 0-16-3-22-9L114 252c-32-32-32-84 0-116 28-28 72-32 104-10l38 26 38-26c32-22 76-18 104 10 32 32 32 84 0 116L278 371c-6 6-14 9-22 9z" fill="#fdf9f4"/>
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
