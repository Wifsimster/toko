import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { build, compactPath, staleFiles } from "../scripts/generate.mjs";
import { MO_REFLECTION_STATES, MO_WAVE_BODY, MO_WAVE_HAND, moWaveAngle, pickMoSize } from "../src/index.ts";

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
  for (const dir of ["mascotte", "scenes", "icons", "compagnons", "pictos"]) {
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
    expect(paths.length).toBeGreaterThan(2000);
    for (const { file, d } of paths) {
      expect(segments(compactPath(d)), file).toEqual(segments(d));
    }
  });

  it("chaque état existe en grand et en petit, en clair seulement, avec les viewBox de la direction", () => {
    const files = build();
    const states = [...files.keys()].filter((k) => k.startsWith("art/"));
    expect(states).toHaveLength(22);
    expect(states.filter((k) => k.includes("-dark"))).toEqual([]);
    for (const rel of states) {
      const viewBox = files.get(rel).match(/"viewBox": "([^"]*)"/)[1];
      expect(viewBox, rel).toBe(/-small\.ts$/.test(rel) ? "6 18 188 188" : "-10 -10 220 220");
    }
  });

  it("une scène dont la pose diffère d'un état garde l'état et note les tracés remplacés", () => {
    const parti = build().get("scenes/parti.ts");
    const mo = JSON.parse(parti.slice(parti.indexOf("= {") + 2, parti.lastIndexOf(";"))).layers.find((l) => l.kind === "mo");
    expect(mo.state).toBe("marche");
    expect(mo.poseOverrides.length).toBeGreaterThan(0);
    expect(mo.poseOverrides.length).toBeLessThanOrEqual(5);
  });

  it("passe à la version petite sous 96 px", () => {
    expect(pickMoSize(95)).toBe("small");
    expect(pickMoSize(96)).toBe("large");
  });

  it("chaque compagnon a ses cinq dessins, avec les viewBox de la direction", () => {
    const files = build();
    const ids = JSON.parse(files.get("ids.ts").match(/COMPANION_IDS = (\[[^\]]*\])/)[1]);
    // Les ids de CRITTER_CATALOG (apps/mobile/src/lib/critters.ts), persistés par /companions.
    expect(ids).toEqual([
      "bear", "butterfly", "cat", "chick", "dog", "fox", "frog", "hedgehog", "koala", "ladybug",
      "lion", "monkey", "owl", "panda", "penguin", "pig", "rabbit", "turtle", "unicorn", "whale",
    ]);
    const viewBoxes = { large: "-10 -10 220 220", small: "4 4 192 192", locked: "4 4 192 192", egg: "20 20 160 170", "egg-small": "20 20 160 170" };
    for (const id of ids) {
      for (const [variant, viewBox] of Object.entries(viewBoxes)) {
        const rel = `companions/${id}-${variant}.ts`;
        expect(files.get(rel), rel).toContain(`"viewBox": "${viewBox}"`);
      }
    }
  });

  it("isole la main qui salue de l'accueil, avec un poignet caché derrière le corps", () => {
    const files = build();
    const artOf = (rel) => {
      const src = files.get(rel);
      return JSON.parse(src.slice(src.indexOf("= {") + 2, src.lastIndexOf(";")));
    };
    // Point dans un polygone (tracés M/L absolus), par la règle pair-impair.
    const inside = ([x, y], d) => {
      const n = d.match(/-?\d+\.?\d*/g).map(Number);
      let hit = false;
      for (let i = 0, j = n.length - 2; i < n.length; j = i, i += 2) {
        const [xi, yi, xj, yj] = [n[i], n[i + 1], n[j], n[j + 1]];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    };
    for (const size of ["large", "small"]) {
      const art = artOf(`art/accueil-${size}.ts`);
      const wave = art.paths.flatMap((p, i) => (p.part === "wave" ? [i] : []));
      // L'aplat et son contour, contigus, peints avant le corps.
      expect(wave, size).toHaveLength(2);
      expect(wave[1] - wave[0], size).toBe(1);
      const body = art.paths.findIndex((p, i) => i > wave[1] && p.fill === "#D9EEE6");
      expect(body, size).toBeGreaterThan(wave[1]);
      // Le poignet touche la main et entre dans le corps : la main tourne sans se détacher.
      const [px, py] = art.wave.pivot;
      const hand = art.paths[wave[0]].d.match(/-?\d+\.?\d*/g).map(Number);
      let nearest = Infinity;
      for (let i = 0; i < hand.length; i += 2) nearest = Math.min(nearest, Math.hypot(hand[i] - px, hand[i + 1] - py));
      expect(nearest, size).toBeLessThan(2);
      expect(inside(art.wave.pivot, art.paths[body].d), size).toBe(true);
    }
    for (const rel of [...files.keys()].filter((k) => k.startsWith("art/") && !k.startsWith("art/accueil-"))) {
      expect(files.get(rel), rel).not.toContain('"wave"');
    }
  });

  it("le salut finit exactement sur la pose statique", () => {
    for (const keys of [MO_WAVE_HAND, MO_WAVE_BODY]) {
      expect(moWaveAngle(keys, 0)).toBe(0);
      expect(moWaveAngle(keys, 1)).toBe(0);
      expect(moWaveAngle(keys, 1.5)).toBe(0);
    }
    // Entre deux clés, l'angle reste entre leurs valeurs (pas de dépassement).
    expect(moWaveAngle(MO_WAVE_HAND, 0.08)).toBeGreaterThan(0);
    expect(moWaveAngle(MO_WAVE_HAND, 0.08)).toBeLessThan(14);
  });

  it("l'entrée enfant ne montre jamais Mō fatigué, débordé ou inquiet, reste synchrone", () => {
    const child = build().get("child.ts");
    for (const state of MO_REFLECTION_STATES) expect(child).not.toContain(`/art/${state}-`);
    // Clair seulement : aucun dessin de mascotte/dark/.
    expect(child).not.toMatch(/dark/i);
    // Un import() ferait embarquer par Metro tous les dessins qu'il peut atteindre.
    expect(child).not.toContain("import(");
    expect(child).not.toMatch(/companions\/[a-z]+-egg/);
  });
});
