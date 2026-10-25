import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { build, compactPath, staleFiles } from "../scripts/generate.mjs";
import { pickMoSize } from "../src/index.ts";

const SVG = join(import.meta.dirname, "..", "svg");
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

// Lecture indépendante d'un attribut `d` : chaque segment devient
// [commande, ...nombres], les répétitions implicites étant dépliées.
function segments(d) {
  const out = [];
  const re = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
  for (const [, cmd, args] of d.matchAll(re)) {
    const nums = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number)
      // -0 et 0 désignent le même point.
      .map((v) => (v === 0 ? 0 : v));
    const n = ARITY[cmd.toUpperCase()];
    if (n === 0) {
      out.push([cmd]);
      continue;
    }
    for (let i = 0; i < nums.length; i += n) {
      // Après M, les paires suivantes sont des L implicites.
      const c = i > 0 && cmd === "M" ? "L" : i > 0 && cmd === "m" ? "l" : cmd;
      out.push([c, ...nums.slice(i, i + n)]);
    }
  }
  return out;
}

function sourcePaths() {
  const all = [];
  for (const dir of ["mascotte", "mascotte/dark", "scenes", "icons"]) {
    for (const f of readdirSync(join(SVG, dir)).filter((n) => n.endsWith(".svg"))) {
      const svg = readFileSync(join(SVG, dir, f), "utf-8");
      for (const m of svg.matchAll(/<path\b[^>]*\sd="([^"]*)"/g)) all.push({ file: `${dir}/${f}`, d: m[1] });
    }
  }
  return all;
}

describe("génération des données de Mō", () => {
  it("src/generated correspond aux SVG de svg/", () => {
    expect(staleFiles()).toEqual([]);
  });

  it("l'allègement des tracés garde la même géométrie", () => {
    const paths = sourcePaths();
    expect(paths.length).toBeGreaterThan(500);
    for (const { file, d } of paths) {
      expect(segments(compactPath(d)), file).toEqual(segments(d));
    }
  });

  it("chaque état existe en grand et en petit, clair et sombre, avec les viewBox de la direction", () => {
    const files = build();
    const states = [...files.keys()].filter((k) => k.startsWith("art/"));
    expect(states).toHaveLength(44);
    for (const rel of states) {
      const viewBox = files.get(rel).match(/"viewBox": "([^"]*)"/)[1];
      expect(viewBox, rel).toBe(/-small(-dark)?\.ts$/.test(rel) ? "6 18 188 188" : "-10 -10 220 220");
    }
  });

  it("une scène dont la pose diffère d'un état garde l'état et note les tracés remplacés", () => {
    const parti = build().get("scenes/parti.ts");
    const mo = JSON.parse(parti.slice(parti.indexOf("= {") + 2, parti.lastIndexOf(";"))).layers.find((l) => l.kind === "mo");
    expect(mo.state).toBe("marche");
    expect(mo.lightOverrides.length).toBeGreaterThan(0);
    expect(mo.lightOverrides.length).toBeLessThanOrEqual(5);
  });

  it("passe à la version petite sous 96 px", () => {
    expect(pickMoSize(95)).toBe("small");
    expect(pickMoSize(96)).toBe("large");
  });
});
