import { describe, expect, it } from "vitest";
import {
  areaPath,
  barkleyProgress,
  chartGeometry,
  chartSummary,
  consistencyTone,
  linePath,
  moodLabelFor,
  valueOrDash,
  weekdayShortFr,
} from "../src/lib/home-stats";

describe("indicateurs de l'accueil", () => {
  it("libellé d'humeur identique au web", () => {
    expect(moodLabelFor(null)).toBeNull();
    expect(moodLabelFor(undefined)).toBeNull();
    expect(moodLabelFor(0)).toBe("Difficile");
    expect(moodLabelFor(3)).toBe("Difficile");
    expect(moodLabelFor(4)).toBe("Moyen");
    expect(moodLabelFor(5)).toBe("Moyen");
    expect(moodLabelFor(6)).toBe("Bien");
    expect(moodLabelFor(7)).toBe("Bien");
    expect(moodLabelFor(8)).toBe("Super");
    expect(moodLabelFor(10)).toBe("Super");
  });

  it("seuils de constance 70 / 40 comme le web", () => {
    expect(consistencyTone(null)).toBe("none");
    expect(consistencyTone(undefined)).toBe("none");
    expect(consistencyTone(70)).toBe("good");
    expect(consistencyTone(69)).toBe("mid");
    expect(consistencyTone(40)).toBe("mid");
    expect(consistencyTone(39)).toBe("low");
    expect(consistencyTone(0)).toBe("low");
  });

  it("tiret quand la valeur manque, zéro affiché sinon", () => {
    expect(valueOrDash(null)).toBe("—");
    expect(valueOrDash(undefined)).toBe("—");
    expect(valueOrDash(0)).toBe("0");
    expect(valueOrDash(42)).toBe("42");
  });
});

describe("progression Barkley", () => {
  it("rien tant que les étapes ne sont pas chargées", () => {
    expect(barkleyProgress(undefined, 3)).toBeNull();
  });

  it("masquée sans étape terminée ni étoile", () => {
    expect(barkleyProgress([], 0)).toBeNull();
    expect(barkleyProgress([{ completedAt: null }], undefined)).toBeNull();
  });

  it("visible avec des étoiles seules", () => {
    expect(barkleyProgress([], 2)).toEqual({ completed: 0, current: 1, total: 10, ratio: 0, stars: 2 });
  });

  it("étape courante = terminées + 1, plafonnée à 10", () => {
    const done = (n: number) => Array.from({ length: n }, () => ({ completedAt: "2026-10-01" }));
    expect(barkleyProgress(done(3), 0)).toMatchObject({ completed: 3, current: 4, ratio: 0.3 });
    expect(barkleyProgress(done(10), 0)).toMatchObject({ completed: 10, current: 10, ratio: 1 });
  });
});

describe("graphique de la semaine", () => {
  const point = (date: string, mood: number, focus: number, agitation: number) => ({ date, mood, focus, agitation });

  it("jours courts en français", () => {
    expect(weekdayShortFr("2026-10-31")).toBe("Sam");
    expect(weekdayShortFr("2026-11-01T00:00:00.000Z")).toBe("Dim");
    expect(weekdayShortFr("n'importe quoi")).toBe("n'importe quoi");
  });

  it("projette 0-10 sur la hauteur, centre chaque jour dans sa colonne", () => {
    const g = chartGeometry([point("2026-10-30", 0, 5, 10), point("2026-10-31", 10, 5, 0)], 200, 100, weekdayShortFr);
    expect(g.labels).toEqual(["Ven", "Sam"]);
    expect(g.series.mood).toEqual([{ x: 50, y: 100 }, { x: 150, y: 0 }]);
    expect(g.series.focus[0].y).toBe(50);
    expect(g.series.agitation).toEqual([{ x: 50, y: 0 }, { x: 150, y: 100 }]);
  });

  it("un seul relevé : point centré, pas de surface", () => {
    const g = chartGeometry([point("2026-10-31", 5, 5, 5)], 200, 100, weekdayShortFr);
    expect(g.series.mood).toEqual([{ x: 100, y: 50 }]);
    expect(areaPath(g.series.mood, 100)).toBe("");
  });

  it("borne les valeurs hors échelle", () => {
    const g = chartGeometry([point("2026-10-31", 99, -4, 5)], 100, 100, weekdayShortFr);
    expect(g.series.mood[0].y).toBe(0);
    expect(g.series.focus[0].y).toBe(100);
  });

  it("construit les tracés", () => {
    const pts = [{ x: 0, y: 10 }, { x: 50, y: 20 }];
    expect(linePath(pts)).toBe("M0.0 10.0 L50.0 20.0");
    expect(areaPath(pts, 100)).toBe("M0.0 10.0 L50.0 20.0 L50.0 100.0 L0.0 100.0 Z");
  });

  it("résumé lu par les lecteurs d'écran, vide sans donnée", () => {
    expect(chartSummary([])).toBe("");
    expect(chartSummary([point("2026-10-30", 1, 2, 3), point("2026-10-31", 6, 7, 2)])).toBe(
      "Dernier relevé : régulation émotionnelle 6 sur 10, concentration 7 sur 10, agitation 2 sur 10",
    );
  });
});
