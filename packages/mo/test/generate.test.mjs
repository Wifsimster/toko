import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { build, compactPath, staleFiles } from "../scripts/generate.mjs";
import {
  MO_GESTURES,
  MO_REFLECTION_STATES,
  MO_WAVE_BODY,
  MO_WAVE_HAND,
  moGesturePose,
  moWaveAngle,
  pickMoSize,
} from "../src/index.ts";

const SVG = join(import.meta.dirname, "..", "svg");
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

function segments(d) {
  const out = [];
  const re = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
  for (const [, cmd, args] of d.matchAll(re)) {
    const nums = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number)
      .map((v) => (v === 0 ? 0 : v));
    const n = ARITY[cmd.toUpperCase()];
    if (n === 0) {
      out.push([cmd]);
      continue;
    }
    for (let i = 0; i < nums.length; i += n) {
      const c = i > 0 && cmd === "M" ? "L" : i > 0 && cmd === "m" ? "l" : cmd;
      out.push([c, ...nums.slice(i, i + n)]);
    }
  }
  return out;
}

function sourcePaths() {
  const all = [];
  for (const dir of ["mascotte", "scenes", "barkley", "icons", "compagnons", "pictos"]) {
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
  }, 30_000);

  it("chaque état existe en grand et en petit, en clair seulement, avec les viewBox de la direction", () => {
    const files = build();
    const states = [...files.keys()].filter((k) => k.startsWith("art/"));
    expect(states).toHaveLength(52);
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

  it("chaque picto a ses deux dessins, avec les viewBox de la direction, et passe par l'entrée enfant", () => {
    const files = build();
    const names = JSON.parse(files.get("ids.ts").match(/PICTO_NAMES = (\[[^\]]*\])/)[1]);
    expect(names).toEqual([
      "ballon", "bol", "bulle", "cahier", "calin", "cartable", "chaussette", "chaussures", "cloche", "crayon",
      "dents", "douche", "ecran", "gouter", "habits", "lampe", "lavabo", "livre", "loupe", "medicament",
      "oeuf-0", "oeuf-1", "oeuf-2", "oeuf-3", "oeuf-ouvert", "oreiller", "pyjama", "rangement", "repas", "sablier", "verre",
    ]);
    const child = files.get("child.ts");
    for (const name of names) {
      for (const [size, viewBox] of [["large", "0 0 120 120"], ["small", "6 6 108 108"]]) {
        const rel = `pictos/${name}-${size}.ts`;
        expect(files.get(rel), rel).toContain(`"viewBox": "${viewBox}"`);
        expect(child, rel).toContain(`from "./${rel.slice(0, -3)}"`);
      }
    }
  });

  it("isole la main qui salue de l'accueil, avec un poignet caché derrière le corps", () => {
    const files = build();
    const artOf = (rel) => {
      const src = files.get(rel);
      return JSON.parse(src.slice(src.indexOf("= {") + 2, src.lastIndexOf(";")));
    };
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
      expect(wave, size).toHaveLength(2);
      expect(wave[1] - wave[0], size).toBe(1);
      const body = art.paths.findIndex((p, i) => i > wave[1] && p.fill === "#D9EEE6");
      expect(body, size).toBeGreaterThan(wave[1]);
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
    expect(moWaveAngle(MO_WAVE_HAND, 0.08)).toBeGreaterThan(0);
    expect(moWaveAngle(MO_WAVE_HAND, 0.08)).toBeLessThan(14);
  });

  it("isole le macron de « calme » et « bravo », au-dessus du corps, avec son contour", () => {
    const files = build();
    const artOf = (rel) => {
      const src = files.get(rel);
      return JSON.parse(src.slice(src.indexOf("= {") + 2, src.lastIndexOf(";")));
    };
    const box = (d) => {
      const n = d.match(/-?\d+\.?\d*/g).map(Number);
      const xs = n.filter((_, i) => i % 2 === 0);
      const ys = n.filter((_, i) => i % 2 === 1);
      return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    };
    for (const state of ["calme", "bravo"]) {
      for (const size of ["large", "small"]) {
        const where = `${state}-${size}`;
        const art = artOf(`art/${where}.ts`);
        const macron = art.paths.flatMap((p, i) => (p.part === "macron" ? [i] : []));
        expect(macron.length, where).toBe(size === "large" ? 3 : 2);
        expect(macron.at(-1) - macron[0], where).toBe(macron.length - 1);
        const [fill, contour] = [art.paths[macron[0]], art.paths[macron.at(-1)]];
        expect(fill.fill, where).toBe("#3A8C93");
        expect(contour.fill, where).toBe("#1E2A2E");
        const f = box(fill.d);
        const c = box(contour.d);
        expect(c.x0 <= f.x0 && c.y0 <= f.y0 && c.x1 >= f.x1 && c.y1 >= f.y1, where).toBe(true);
        const body = art.paths.filter((p) => p.fill === "#D9EEE6").map((p) => box(p.d));
        const top = Math.min(...body.map((b) => b.y0));
        expect(f.y1, where).toBeLessThan(top);
        expect(art.ground, where).toEqual([100, 181]);
      }
    }
    for (const rel of [...files.keys()].filter((k) => k.startsWith("art/") && !/^art\/(calme|bravo)-/.test(k))) {
      expect(files.get(rel), rel).not.toContain('"macron"');
      expect(artOf(rel).ground, rel).toBeUndefined();
    }
  });

  it("chaque geste dure 1 à 1,5 s et finit exactement sur la pose statique", () => {
    const rest = { lift: 0, stretch: 0, macron: 0, shadow: 1 };
    for (const [name, gesture] of Object.entries(MO_GESTURES)) {
      expect(gesture.durationMs, name).toBeGreaterThanOrEqual(1000);
      expect(gesture.durationMs, name).toBeLessThanOrEqual(1500);
      expect(moGesturePose(gesture, 0), name).toEqual(rest);
      expect(moGesturePose(gesture, 1), name).toEqual(rest);
      expect(moGesturePose(gesture, 1.5), name).toEqual(rest);
    }
    expect(moGesturePose(MO_GESTURES.idee, 0.65).macron).toBe(-6);
    expect(moGesturePose(MO_GESTURES.idee, 0.65).lift).toBe(0);
    const apex = moGesturePose(MO_GESTURES.saut, 0.42);
    expect(apex.lift).toBe(-12);
    expect(apex.shadow).toBeLessThan(1);
  });

  it("l'entrée enfant contient « calme » et « bravo », les deux états qui ont un geste", () => {
    const child = build().get("child.ts");
    expect(child).toContain("./art/calme-large");
    expect(child).toContain("./art/bravo-large");
  });

  it("l'entrée enfant ne montre jamais Mō fatigué, débordé ou inquiet, reste synchrone", () => {
    const child = build().get("child.ts");
    for (const state of MO_REFLECTION_STATES) expect(child).not.toContain(`/art/${state}-`);
    expect(child).not.toMatch(/dark/i);
    expect(child).not.toContain("import(");
    expect(child).not.toMatch(/companions\/[a-z]+-egg/);
  });

  it("l'entrée parent de l'app reste synchrone, sans état de reflet, scène ni compagnon", () => {
    const parent = build().get("parent.ts");
    for (const state of MO_REFLECTION_STATES) expect(parent).not.toContain(`/art/${state}-`);
    for (const state of ["fierte", "concentration", "marche", "accueil"]) {
      expect(parent).toContain(`./art/${state}-large`);
      expect(parent).toContain(`./art/${state}-small`);
    }
    expect(parent).not.toMatch(/dark/i);
    expect(parent).not.toContain("import(");
    expect(parent).not.toMatch(/scenes\/|companions\/|pictos\//);
  });

  it("l'entrée du sélecteur d'humeur porte les cinq visages du parent, en petit, et rien d'autre", () => {
    const files = build();
    const mood = files.get("mood.ts");
    for (const state of [...MO_REFLECTION_STATES, "calme", "fierte"]) expect(mood).toContain(`./art/${state}-small`);
    expect(mood.match(/^import \{ art as /gm)).toHaveLength(5);
    expect(mood).not.toContain("-large");
    expect(mood).not.toMatch(/dark/i);
    expect(mood).not.toContain("import(");
    expect(mood).not.toMatch(/scenes\/|companions\/|pictos\//);
    expect(files.get("child.ts")).not.toContain("mood");
    expect(files.get("parent.ts")).not.toContain("mood");
  });

  it("les états vides « enquête » passent par l'entrée parent, sans scène de thème ni pose de crise", () => {
    const parent = build().get("parent.ts");
    for (const state of ["enquete", "enquete-boite", "enquete-dessous"]) {
      expect(parent).toContain(`./art/${state}-large`);
      expect(parent).toContain(`./art/${state}-small`);
    }
    expect(parent).not.toMatch(/\/art\/(theme-|accompagne|present)/);
  });

  it("l'entrée des thèmes porte les dix scènes, en grand et en petit, et rien d'autre", () => {
    const files = build();
    const themes = files.get("themes.ts");
    const states = [
      "theme-attention", "theme-cadre", "theme-comprendre", "theme-consignes", "theme-ecole",
      "theme-emotions", "theme-entourage", "theme-recompenses", "theme-soins", "theme-sommeil",
    ];
    for (const state of states) {
      expect(themes).toContain(`./art/${state}-large`);
      expect(themes).toContain(`./art/${state}-small`);
    }
    expect(themes.match(/^import \{ art as /gm)).toHaveLength(20);
    expect(themes).not.toContain("import(");
    expect(files.get("child.ts")).not.toContain("theme-");
  });

  it("l'entrée de crise ne porte que « accompagne », synchrone, jamais côté enfant", () => {
    const files = build();
    const crisis = files.get("crisis.ts");
    expect(crisis.match(/^import \{ art as /gm)).toHaveLength(2);
    expect(crisis).toContain("./art/accompagne-large");
    expect(crisis).toContain("./art/accompagne-small");
    expect(crisis).not.toContain("import(");
    for (const entry of ["child.ts", "parent.ts", "mood.ts", "themes.ts"]) {
      expect(files.get(entry), entry).not.toMatch(/accompagne|present/);
    }
  });

  it("l'entrée Barkley charge à la demande les quatre scènes de chacune des dix étapes, avec un Mō côté parent", () => {
    const files = build();
    const scenes = [...files.keys()].filter((k) => k.startsWith("barkley/")).sort();
    const steps = [...new Set(scenes.map((k) => Number(k.match(/etape-(\d+)-/)[1])))].sort((a, b) => a - b);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const expected = steps.flatMap((step) =>
      ["comprendre", "exercice", "situations", "technique"].map((s) => `barkley/etape-${step}-${s}.ts`),
    );
    expect(scenes).toEqual(expected.sort());
    const entry = files.get("barkley.ts");
    expect(entry).not.toMatch(/^import \{/m);
    for (const step of steps) {
      for (const [section, file] of [["understand", "comprendre"], ["technique", "technique"], ["scenarios", "situations"], ["practice", "exercice"]]) {
        expect(entry).toContain(`${section}: () => import("./barkley/etape-${step}-${file}")`);
      }
    }
    const parentStates = JSON.parse(files.get("parent.ts").match(/PARENT_MO_STATES = (\[[^\]]*\])/)[1]);
    for (const rel of scenes) {
      const src = files.get(rel);
      const scene = JSON.parse(src.slice(src.indexOf("= {") + 2, src.lastIndexOf(";")));
      expect(scene.viewBox, rel).toBe("0 0 360 200");
      const mos = scene.layers.filter((l) => l.kind === "mo");
      expect(mos, rel).toHaveLength(1);
      expect(parentStates, rel).toContain(mos[0].state);
      expect(mos[0].poseOverrides, rel).toBeUndefined();
      expect(scene.layers.some((l) => l.kind === "text"), rel).toBe(false);
    }
    for (const other of ["child.ts", "parent.ts", "mood.ts", "themes.ts", "crisis.ts"]) {
      expect(files.get(other), other).not.toContain("barkley");
    }
  });
});
