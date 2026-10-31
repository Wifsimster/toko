import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(here, "..", "public", "og-image.svg");
const pngPath = resolve(here, "..", "public", "og-image.png");

const svg = readFileSync(svgPath);

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: {
    loadSystemFonts: true,
    defaultFontFamily: "sans-serif",
  },
  background: "#fdf9f4",
});

const png = resvg.render().asPng();
writeFileSync(pngPath, png);

console.log(`ok ${pngPath} — ${(png.byteLength / 1024).toFixed(1)} kB`);
