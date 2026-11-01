import { describe, expect, it } from "vitest";
import fr from "../../web/src/lib/i18n/locales/fr.json";
import {
  DEFAULT_MOBILE_TABS,
  HUB_ITEMS,
  MOBILE_TAB_IDS,
  PRIMARY_NAV,
  normalizeMobileTabs,
  resolveMobileTabs,
  toggleMobileTab,
  type MobileTabId,
} from "@focusflow/validators";
import { nav } from "../src/lib/copy";
import { navIcon } from "../src/navigation/nav-icons";
import {
  MENU_BAR_GROUPS,
  MIDDLE_TAB_ROUTES,
  SECTION_BY_TARGET,
  TAB_DEFS,
  bottomBar,
  hiddenTabRoutes,
  hubSections,
  plusScreens,
  sectionTarget,
} from "../src/navigation/nav-model";

const PRESETS: MobileTabId[][] = [
  [...DEFAULT_MOBILE_TABS],
  ["journal"],
  ["crisis", "routines", "timer"],
  ["account", "lexicon"],
  ["report", "barkley", "suivi"],
  ["medications", "rewards", "insights"],
];

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
    expect(bottomBar(DEFAULT_MOBILE_TABS)).toEqual(bottomBar());
    expect(DEFAULT_MOBILE_TABS.map((id) => TAB_DEFS[id].to)).toEqual(
      PRIMARY_NAV.filter((i) => i.to !== "/dashboard").map((i) => i.to),
    );
  });
});

describe("barre du bas personnalisée", () => {
  it("garde Accueil en premier et Plus en dernier, avec les onglets choisis dans l'ordre", () => {
    expect(bottomBar(["crisis", "lexicon", "account"]).map((t) => [t.route, t.title, t.icon])).toEqual([
      ["AccueilTab", "Accueil", "BarChart3"],
      ["CriseTab", "Crise", "HandHeart"],
      ["LexiqueTab", "Lexique", "BookA"],
      ["CompteTab", "Compte", "UserCog"],
      ["PlusTab", "Plus", "Menu"],
    ]);
  });

  it("Plus reste le dernier onglet quel que soit le choix", () => {
    for (const tabs of PRESETS) {
      const bar = bottomBar(tabs);
      expect(bar[0]?.route).toBe("AccueilTab");
      expect(bar.at(-1)?.route).toBe("PlusTab");
      expect(bar.filter((t) => t.route === "PlusTab")).toHaveLength(1);
    }
  });

  it("une valeur enregistrée périmée retombe sur une barre valide", () => {
    expect(bottomBar(resolveMobileTabs(["calm", "journal", "quiz"])).map((t) => t.route)).toEqual([
      "AccueilTab",
      "JournalTab",
      "PlusTab",
    ]);
    expect(bottomBar(resolveMobileTabs(["calm"]))).toEqual(bottomBar());
    expect(bottomBar(resolveMobileTabs("garbage"))).toEqual(bottomBar());
  });

  it("rétablir la barre par défaut redonne la barre du web et s'enregistre comme null", () => {
    expect(bottomBar(resolveMobileTabs(normalizeMobileTabs(DEFAULT_MOBILE_TABS)))).toEqual(bottomBar());
    expect(normalizeMobileTabs(DEFAULT_MOBILE_TABS)).toBeNull();
    expect(normalizeMobileTabs(["report", "timer"])).toEqual(["report", "timer"]);
  });

  it("chaque onglet possible a sa pile, cachée tant qu'il n'est pas dans la barre", () => {
    expect(new Set(MIDDLE_TAB_ROUTES).size).toBe(MOBILE_TAB_IDS.length);
    for (const tabs of PRESETS) {
      const shown = bottomBar(tabs).map((t) => t.route);
      const hidden = hiddenTabRoutes(tabs);
      expect([...shown.slice(1, -1), ...hidden].sort()).toEqual([...MIDDLE_TAB_ROUTES].sort());
      for (const route of hidden) expect(shown).not.toContain(route);
    }
  });
});

describe("catalogue des onglets", () => {
  it("couvre chaque destination du hub qui existe sur mobile", () => {
    const targets = MOBILE_TAB_IDS.map((id) => TAB_DEFS[id].to);
    for (const target of Object.keys(SECTION_BY_TARGET)) expect(targets).toContain(target);
    for (const item of PRIMARY_NAV.filter((i) => i.to !== "/dashboard")) expect(targets).toContain(item.to);
  });

  it("reprend l'écran et le besoin d'un enfant du hub", () => {
    for (const id of MOBILE_TAB_IDS) {
      const def = TAB_DEFS[id];
      const section = def.to ? SECTION_BY_TARGET[def.to] : undefined;
      if (section) expect([def.root, def.child], id).toEqual([section.root, section.child]);
    }
    expect(TAB_DEFS.barkley).toMatchObject({ root: "Barkley", child: true });
    expect(TAB_DEFS.account).toMatchObject({ root: "Settings", child: false });
    expect(TAB_DEFS.suivi).toMatchObject({ root: "SuiviHub", child: false });
    expect(TAB_DEFS.report).toMatchObject({ root: "Report", child: true });
  });

  it("range chaque onglet dans un groupe affiché par l'écran Barre de menu", () => {
    const groups = new Set(MENU_BAR_GROUPS.map((g) => g.key));
    for (const id of MOBILE_TAB_IDS) expect(groups.has(TAB_DEFS[id].group), id).toBe(true);
    expect(MENU_BAR_GROUPS.map((g) => g.title)).toEqual([
      "Pages principales",
      "Comprendre le TDAH",
      "Au quotidien",
      "Motivation & outils",
      "En cas de besoin",
    ]);
  });

  it("garde des libellés courts dans la barre", () => {
    for (const id of MOBILE_TAB_IDS) expect(TAB_DEFS[id].short.length, id).toBeLessThanOrEqual(12);
  });

  it("le choix ne dépasse jamais trois onglets entre Accueil et Plus", () => {
    let tabs: MobileTabId[] = [...DEFAULT_MOBILE_TABS];
    for (const id of MOBILE_TAB_IDS) {
      tabs = toggleMobileTab(tabs, id);
      expect(bottomBar(tabs).length).toBeLessThanOrEqual(5);
    }
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
      ["Comprendre le TDAH", ["Articles", "Lexique"]],
      ["Au quotidien", ["Journal", "Symptômes", "Médicaments", "Routines"]],
      ["Motivation & outils", ["Récompenses", "Minuteur", "Analyses"]],
      ["En cas de besoin", ["Liste de crise"]],
    ]);
  });

  it("propose le lexique, mais pas les questionnaires, absents du mobile", () => {
    const targets = hubSections().flatMap((s) => s.rows.map((r) => r.to));
    expect(targets).toContain("/lexique");
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
      Lexique: false,
    });
  });
});

describe("Plus", () => {
  it("ne garde que ce qui n'est ni dans la barre ni dans le hub", () => {
    const hubRoots = new Set(hubSections().flatMap((s) => s.rows.map((r) => r.root)));
    const plusRoots = plusScreens(DEFAULT_MOBILE_TABS).map((p) => p.root);
    expect(plusRoots).toEqual(["Report"]);
    for (const root of plusRoots) expect(hubRoots.has(root as never)).toBe(false);
    expect(plusScreens(DEFAULT_MOBILE_TABS).map((p) => p.title)).toEqual(["Rapport"]);
  });

  it("propose les pages principales retirées de la barre", () => {
    expect(plusScreens(["journal", "report"]).map((p) => p.title)).toEqual([
      "Suivi",
      "Programme Barkley",
      "Mon compte",
    ]);
    expect(plusScreens(["suivi", "barkley", "report"]).map((p) => p.root)).toEqual(["Settings"]);
  });
});

describe("ouverture de section", () => {
  it("avec la barre par défaut, route comme avant", () => {
    const tabs = DEFAULT_MOBILE_TABS;
    expect(sectionTarget(tabs, "routines")).toMatchObject({ route: "SuiviTab", screen: "Routines", initial: false });
    expect(sectionTarget(tabs, "symptoms")).toMatchObject({ route: "SuiviTab", screen: "Symptoms" });
    expect(sectionTarget(tabs, "crisis")).toMatchObject({ route: "SuiviTab", screen: "CrisisList", child: true });
    expect(sectionTarget(tabs, "barkley")).toMatchObject({ route: "BarkleyTab", initial: true, child: true });
    expect(sectionTarget(tabs, "report").route).toBe("PlusTab");
  });

  it("ouvre l'onglet choisi quand la page est dans la barre", () => {
    expect(sectionTarget(["routines"], "routines")).toMatchObject({ route: "RoutinesTab", screen: "Routines", initial: true });
    expect(sectionTarget(["report"], "report")).toMatchObject({ route: "RapportTab", initial: true });
  });

  it("passe par Plus quand ni la page ni Suivi ne sont dans la barre", () => {
    expect(sectionTarget(["journal"], "routines")).toMatchObject({ route: "PlusTab", screen: "Routines", initial: false });
    expect(sectionTarget(["journal"], "barkley")).toMatchObject({ route: "PlusTab", screen: "Barkley" });
    expect(sectionTarget(["journal"], "account")).toMatchObject({ route: "PlusTab", screen: "Settings" });
  });

  it("chaque destination reste joignable depuis un onglet visible", () => {
    for (const tabs of PRESETS) {
      const shown = bottomBar(tabs).map((t) => t.route);
      for (const id of MOBILE_TAB_IDS) expect(shown, `${tabs.join(",")} > ${id}`).toContain(sectionTarget(tabs, id).route);
    }
  });
});

describe("icônes de navigation", () => {
  it("chaque nom d'icône de la barre, du hub et de Plus se résout", () => {
    const names = [
      ...bottomBar().map((t) => t.icon),
      ...hubSections().flatMap((s) => s.rows.map((r) => r.icon)),
      ...MOBILE_TAB_IDS.map((id) => TAB_DEFS[id].icon),
      "PanelBottom",
    ];
    for (const name of names) expect(() => navIcon(name), name).not.toThrow();
  });
});
