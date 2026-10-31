import { describe, expect, it } from "vitest";
import fr from "../../web/src/lib/i18n/locales/fr.json";
import { HUB_ITEMS, PRIMARY_NAV } from "@focusflow/validators";
import { nav } from "../src/lib/copy";
import { navIcon } from "../src/navigation/nav-icons";
import { PLUS_SCREENS, SECTIONS, bottomBar, hubSections } from "../src/navigation/nav-model";

const webText = (key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], fr);

describe("barre du bas mobile", () => {
  it("garde l'ordre, les libellés et les icônes du web, puis Plus", () => {
    expect(bottomBar().map((t) => [t.route, t.title, t.icon])).toEqual([
      ["AccueilTab", "Accueil", "BarChart3"],
      ["SuiviTab", "Suivi", "NotebookPen"],
      ["BarkleyTab", "Barkley", "ClipboardList"],
      ["CompteTab", "Compte", "UserCog"],
      ["PlusTab", "Plus", "Menu"],
    ]);
  });

  it("suit exactement la définition partagée", () => {
    expect(bottomBar().slice(0, -1).map((t) => t.to)).toEqual(PRIMARY_NAV.map((i) => i.to));
  });
});

describe("libellés alignés sur le web", () => {
  const keys = [
    ...PRIMARY_NAV.flatMap((i) => [i.labelKey, i.shortLabelKey]),
    ...HUB_ITEMS.flatMap((i) => [i.labelKey, i.descriptionKey]),
    "nav.more",
    "nav.report",
    "suiviHub.title",
    "suiviHub.subtitle",
    "suiviHub.groups.knowledge",
    "suiviHub.groups.daily",
    "suiviHub.groups.tools",
    "suiviHub.groups.resources",
  ];
  for (const key of keys) {
    it(key, () => {
      expect(nav.labels[key]).toBe(webText(key));
    });
  }
});

describe("hub Suivi", () => {
  it("reprend les groupes du web et les entrées existantes sur mobile", () => {
    expect(hubSections().map((s) => [s.title, s.rows.map((r) => r.title)])).toEqual([
      ["Comprendre le TDAH", ["Articles"]],
      ["Au quotidien", ["Journal", "Symptômes", "Médicaments", "Routines"]],
      ["Motivation & outils", ["Récompenses", "Minuteur", "Analyses"]],
      ["En cas de besoin", ["Liste de crise"]],
    ]);
  });

  it("ne propose ni lexique ni questionnaires, absents du mobile", () => {
    const targets = hubSections().flatMap((s) => s.rows.map((r) => r.to));
    expect(targets).not.toContain("/lexique");
    expect(targets).not.toContain("/quiz");
  });

  it("marque les écrans qui demandent un enfant actif", () => {
    const child = Object.fromEntries(hubSections().flatMap((s) => s.rows.map((r) => [r.root, r.child])));
    expect(child).toMatchObject({
      Medications: true,
      Rewards: true,
      Insights: true,
      CrisisList: true,
      Journal: false,
      Symptoms: false,
      Routines: false,
      Timer: false,
      Connaissances: false,
    });
  });
});

describe("Plus", () => {
  it("ne garde que ce qui n'est ni dans la barre ni dans le hub", () => {
    const hubRoots = new Set(hubSections().flatMap((s) => s.rows.map((r) => r.root)));
    const plusRoots = PLUS_SCREENS.map((p) => p.root);
    expect(plusRoots).toEqual(["Report", "CalmMinutes"]);
    for (const root of plusRoots) expect(hubRoots.has(root as never)).toBe(false);
    expect(PLUS_SCREENS.map((p) => p.title)).toEqual(["Rapport", "Minutes calmes"]);
  });
});

describe("ouverture de section depuis l'accueil", () => {
  it("route chaque ancien identifiant vers l'onglet qui le contient", () => {
    expect(SECTIONS.routines).toMatchObject({ route: "SuiviTab", root: "Routines" });
    expect(SECTIONS.symptoms).toMatchObject({ route: "SuiviTab", root: "Symptoms" });
    expect(SECTIONS.barkley).toMatchObject({ route: "BarkleyTab", child: true });
    expect(SECTIONS.report.route).toBe("PlusTab");
    expect(SECTIONS.calm.route).toBe("PlusTab");
  });
});

describe("icônes de navigation", () => {
  it("chaque nom d'icône de la barre, du hub et de Plus se résout", () => {
    const names = [
      ...bottomBar().map((t) => t.icon),
      ...hubSections().flatMap((s) => s.rows.map((r) => r.icon)),
      ...PLUS_SCREENS.map((p) => p.icon),
    ];
    for (const name of names) expect(() => navIcon(name), name).not.toThrow();
  });
});
