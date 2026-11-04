import { describe, expect, it } from "vitest";
import fr from "../../web/src/lib/i18n/locales/fr.json";
import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TAB_IDS,
  MOBILE_TABS_MAX,
  MORE_ENTRIES,
  MORE_GROUPS,
  PRIMARY_NAV,
  normalizeMobileTabs,
  resolveMobileTabs,
  toggleMobileTab,
  type MobileTabId,
} from "@focusflow/validators";
import { menuBar, nav, plus, sos } from "../src/lib/copy";
import { SOS_DISC_SIZE, SOS_DISC_SIZE_COMPACT, sosDiscSize } from "../src/lib/sos";
import { navIcon } from "../src/navigation/nav-icons";
import {
  MIDDLE_TAB_ROUTES,
  PLUS_GROUPS,
  TAB_DEFS,
  SOS_ROUTE,
  bottomBar,
  hiddenTabRoutes,
  sectionTarget,
} from "../src/navigation/nav-model";

const PRESETS: MobileTabId[][] = [
  [...DEFAULT_MOBILE_TABS],
  ["symptoms"],
  ["crisis", "routines"],
  ["account", "lexicon"],
  ["report", "barkley"],
  ["medications", "rewards"],
];

const SOS_TAB = [SOS_ROUTE, "SOS", "HeartPulse"];

const withoutSos = (bar: ReturnType<typeof bottomBar>) => bar.filter((t) => t.route !== SOS_ROUTE);

const webText = (key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], fr);

describe("barre du bas mobile", () => {
  it("garde l'ordre, les libellés et les icônes du web : Accueil, Suivi, SOS, Barkley, Plus", () => {
    expect(bottomBar().map((t) => [t.route, t.title, t.icon])).toEqual([
      ["AccueilTab", "Accueil", "BarChart3"],
      ["SuiviTab", "Suivi", "NotebookPen"],
      SOS_TAB,
      ["BarkleyTab", "Barkley", "ClipboardList"],
      ["PlusTab", "Plus", "Menu"],
    ]);
  });

  it("suit exactement la définition partagée, Compte passant dans Plus", () => {
    expect(withoutSos(bottomBar()).slice(0, -1).map((t) => [t.title, t.icon])).toEqual(
      PRIMARY_NAV.map((i) => [nav.labels[i.shortLabelKey], i.icon]),
    );
    expect(bottomBar(DEFAULT_MOBILE_TABS)).toEqual(bottomBar());
    expect(bottomBar().map((t) => t.route)).not.toContain("CompteTab");
    expect(sectionTarget(DEFAULT_MOBILE_TABS, "account")).toMatchObject({ route: "PlusTab", screen: "Settings" });
  });
});

describe("onglet SOS", () => {
  it("est toujours au centre de la barre, une seule fois, quel que soit le choix", () => {
    for (const tabs of [...PRESETS, ["timer", "insights"] as MobileTabId[]]) {
      const bar = bottomBar(tabs);
      expect(bar.filter((t) => t.route === SOS_ROUTE), tabs.join(",")).toHaveLength(1);
      expect(bar[2]?.route, tabs.join(",")).toBe(SOS_ROUTE);
      if (tabs.length === MOBILE_TABS_MAX) expect(bar).toHaveLength(5);
    }
  });

  it("ne se retire pas et ne se choisit pas : ce n'est pas une destination de la barre", () => {
    expect(MOBILE_TAB_IDS).not.toContain("sos");
    expect(MIDDLE_TAB_ROUTES).not.toContain(SOS_ROUTE);
    expect(hiddenTabRoutes(DEFAULT_MOBILE_TABS)).not.toContain(SOS_ROUTE);
    expect(bottomBar(resolveMobileTabs(["sos", "timer"])).map((t) => t.route)).toEqual([
      "AccueilTab",
      "MinuteurTab",
      SOS_ROUTE,
      "PlusTab",
    ]);
  });

  it("porte le libellé SOS et le nom accessible du bouton SOS", () => {
    const tab = bottomBar().find((t) => t.route === SOS_ROUTE);
    expect(tab).toMatchObject({ id: null, title: sos.buttonLabel, icon: "HeartPulse" });
    expect(sos.openLabel).toBe("Ouvrir le mode SOS Crise");
  });

  it("mesure 56 dp, et rétrécit à 44 dp en paysage ou avec un grand texte", () => {
    expect(SOS_DISC_SIZE).toBe(56);
    expect(sosDiscSize({ width: 390, height: 844, fontScale: 1 })).toBe(SOS_DISC_SIZE);
    expect(sosDiscSize({ width: 844, height: 390, fontScale: 1 })).toBe(SOS_DISC_SIZE_COMPACT);
    expect(sosDiscSize({ width: 390, height: 844, fontScale: 1.3 })).toBe(SOS_DISC_SIZE_COMPACT);
    expect(SOS_DISC_SIZE_COMPACT).toBe(44);
  });
});

describe("migration vers deux onglets choisis", () => {
  it("garde les deux premiers d'un choix de trois, le troisième restant dans Plus", () => {
    const saved = ["crisis", "lexicon", "account"];
    const tabs = resolveMobileTabs(saved);
    expect(tabs).toEqual(["crisis", "lexicon"]);
    expect(bottomBar(tabs).map((t) => t.route)).toEqual(["AccueilTab", "CriseTab", SOS_ROUTE, "LexiqueTab", "PlusTab"]);
    expect(sectionTarget(tabs, "account")).toMatchObject({ route: "PlusTab", screen: "Settings" });
    expect(hiddenTabRoutes(tabs)).toContain("CompteTab");
  });

  it("l'ancienne barre par défaut devient la nouvelle, enregistrée comme null", () => {
    expect(resolveMobileTabs(["suivi", "barkley", "account"])).toEqual([...DEFAULT_MOBILE_TABS]);
    expect(normalizeMobileTabs(["suivi", "barkley", "account"])).toBeNull();
  });

  it("une liste trop longue passée telle quelle n'affiche que deux choix", () => {
    const bar = bottomBar(["symptoms", "medications", "rewards"]);
    expect(bar.map((t) => t.route)).toEqual(["AccueilTab", "SymptomesTab", SOS_ROUTE, "MedicamentsTab", "PlusTab"]);
    expect(hiddenTabRoutes(["symptoms", "medications", "rewards"])).toContain("RecompensesTab");
    expect(sectionTarget(["symptoms", "medications", "rewards"], "rewards").route).toBe("PlusTab");
  });
});

describe("onglet Suivi", () => {
  it("ouvre directement le journal, sans hub", () => {
    expect(TAB_DEFS.suivi).toMatchObject({ route: "SuiviTab", root: "Journal", child: false, short: "Suivi", title: "Journal" });
    expect(TAB_DEFS.suivi.description).toBe("Noter la journée de votre enfant");
  });

  it("lit l'ancien onglet Journal comme Suivi", () => {
    expect(bottomBar(resolveMobileTabs(["journal", "timer"])).map((t) => t.route)).toEqual([
      "AccueilTab",
      "SuiviTab",
      SOS_ROUTE,
      "MinuteurTab",
      "PlusTab",
    ]);
  });
});

describe("barre du bas personnalisée", () => {
  it("garde Accueil en premier et Plus en dernier, avec les onglets choisis de part et d'autre de SOS", () => {
    expect(bottomBar(["crisis", "account"]).map((t) => [t.route, t.title, t.icon])).toEqual([
      ["AccueilTab", "Accueil", "BarChart3"],
      ["CriseTab", "Crise", "HandHeart"],
      SOS_TAB,
      ["CompteTab", "Compte", "UserCog"],
      ["PlusTab", "Plus", "Menu"],
    ]);
  });

  it("parle de la place par rapport à SOS dans l'éditeur", () => {
    expect(menuBar.position(1)).toBe("À gauche de SOS");
    expect(menuBar.position(2)).toBe("À droite de SOS");
    expect(menuBar.rowLabel("Journal", 2)).toBe("Journal, à droite de SOS");
    expect(menuBar.moved("Lexique", 1)).toBe("Lexique à gauche de SOS");
    expect(menuBar.intro(1, MOBILE_TABS_MAX)).toContain("1 ou 2 onglets");
    expect(menuBar.full(MOBILE_TABS_MAX)).toContain("2 onglets");
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
    expect(bottomBar(resolveMobileTabs(["calm", "symptoms", "quiz"])).map((t) => t.route)).toEqual([
      "AccueilTab",
      "SymptomesTab",
      SOS_ROUTE,
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
      const shown = withoutSos(bottomBar(tabs)).map((t) => t.route);
      const hidden = hiddenTabRoutes(tabs);
      expect([...shown.slice(1, -1), ...hidden].sort()).toEqual([...MIDDLE_TAB_ROUTES].sort());
      for (const route of hidden) expect(shown).not.toContain(route);
    }
  });

  it("le choix ne dépasse jamais deux onglets, SOS compris la barre reste à cinq", () => {
    let tabs: MobileTabId[] = [...DEFAULT_MOBILE_TABS];
    for (const id of MOBILE_TAB_IDS) {
      tabs = toggleMobileTab(tabs, id);
      expect(bottomBar(tabs).length).toBeLessThanOrEqual(5);
    }
  });

  it("garde des libellés courts dans la barre", () => {
    for (const id of MOBILE_TAB_IDS) expect(TAB_DEFS[id].short.length, id).toBeLessThanOrEqual(11);
  });

  it("raccourcit Médicaments et Récompenses dans la barre, pas dans Plus", () => {
    expect(TAB_DEFS.medications).toMatchObject({ short: "Traitements", title: "Médicaments" });
    expect(TAB_DEFS.rewards).toMatchObject({ short: "Étoiles", title: "Récompenses" });
    expect(bottomBar(["medications", "rewards"]).map((t) => t.title)).toEqual([
      "Accueil",
      "Traitements",
      "SOS",
      "Étoiles",
      "Plus",
    ]);
  });
});

describe("Plus", () => {
  it("liste presque tout, en groupes simples", () => {
    expect(PLUS_GROUPS.map((g) => [g.title, g.items.map((i) => i.title)])).toEqual([
      ["Au quotidien", ["Journal", "Symptômes", "Médicaments", "Routines"]],
      ["Outils", ["Programme Barkley", "Récompenses", "Minuteur", "Analyses", "Rapport"]],
      ["Comprendre", ["Articles", "Lexique"]],
      ["En cas de besoin", ["Liste de crise"]],
      ["Compte", ["Mon compte"]],
    ]);
  });

  it("propose chaque destination de la barre une seule fois", () => {
    const ids = PLUS_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    expect([...ids].sort()).toEqual([...MOBILE_TAB_IDS].sort());
  });

  it("donne une description courte à chaque entrée", () => {
    for (const id of MOBILE_TAB_IDS) {
      const text = TAB_DEFS[id].description;
      expect(text, id).toBeTruthy();
      expect(text.length, id).toBeLessThanOrEqual(50);
      expect(text, id).toBe(plus.descriptions[id]);
    }
  });

  it("marque les écrans qui demandent un enfant actif", () => {
    const child = Object.fromEntries(MOBILE_TAB_IDS.map((id) => [TAB_DEFS[id].root, TAB_DEFS[id].child]));
    expect(child).toEqual({
      Journal: false,
      Barkley: true,
      Settings: false,
      Report: true,
      Connaissances: false,
      Lexique: false,
      Symptoms: false,
      Medications: true,
      Routines: false,
      Rewards: true,
      Timer: false,
      Insights: true,
      CrisisList: true,
    });
  });

  it("n'a pas de questionnaires, absents du mobile", () => {
    expect(MOBILE_TAB_IDS).not.toContain("quiz");
  });
});

describe("ouverture d'une page", () => {
  it("avec la barre par défaut, passe par Plus pour ce qui n'est pas dans la barre", () => {
    const tabs = DEFAULT_MOBILE_TABS;
    expect(sectionTarget(tabs, "routines")).toEqual({ route: "PlusTab", screen: "Routines", initial: false, child: false });
    expect(sectionTarget(tabs, "symptoms")).toMatchObject({ route: "PlusTab", screen: "Symptoms" });
    expect(sectionTarget(tabs, "crisis")).toMatchObject({ route: "PlusTab", screen: "CrisisList", child: true });
    expect(sectionTarget(tabs, "suivi")).toMatchObject({ route: "SuiviTab", screen: "Journal", initial: true });
    expect(sectionTarget(tabs, "barkley")).toMatchObject({ route: "BarkleyTab", initial: true, child: true });
  });

  it("ouvre l'onglet choisi quand la page est dans la barre", () => {
    expect(sectionTarget(["routines"], "routines")).toMatchObject({ route: "RoutinesTab", screen: "Routines", initial: true });
    expect(sectionTarget(["report"], "report")).toMatchObject({ route: "RapportTab", initial: true });
    expect(sectionTarget(["symptoms"], "account")).toMatchObject({ route: "PlusTab", screen: "Settings" });
  });

  it("chaque destination reste joignable depuis un onglet visible", () => {
    for (const tabs of PRESETS) {
      const shown = bottomBar(tabs).map((t) => t.route);
      for (const id of MOBILE_TAB_IDS) expect(shown, `${tabs.join(",")} > ${id}`).toContain(sectionTarget(tabs, id).route);
    }
  });
});

describe("libellés alignés sur le web", () => {
  const keys = [
    ...PRIMARY_NAV.flatMap((i) => [i.labelKey, i.shortLabelKey]),
    ...Object.values(MORE_ENTRIES).map((i) => i.labelKey),
    "nav.more",
    "nav.report",
    "nav.crisis",
  ];
  for (const key of keys) {
    it(key, () => {
      expect(nav.labels[key]).toBe(webText(key));
    });
  }

  it("reprend le catalogue Plus du web : titres et icônes", () => {
    for (const id of MOBILE_TAB_IDS) {
      expect(TAB_DEFS[id].title, id).toBe(nav.labels[MORE_ENTRIES[id].labelKey]);
      expect(TAB_DEFS[id].icon, id).toBe(MORE_ENTRIES[id].icon);
    }
  });

  it("reprend les groupes et les descriptions de Plus du web", () => {
    expect(PLUS_GROUPS.map((g) => g.title)).toEqual(MORE_GROUPS.map((g) => webText(g.labelKey)));
    for (const id of MOBILE_TAB_IDS) {
      if (id === "account") continue;
      expect(plus.descriptions[id], id).toBe(webText(MORE_ENTRIES[id].descriptionKey));
    }
  });
});

describe("icônes de navigation", () => {
  it("chaque nom d'icône de la barre et de Plus se résout", () => {
    const names = [
      ...bottomBar().map((t) => t.icon),
      ...MOBILE_TAB_IDS.map((id) => TAB_DEFS[id].icon),
      "PanelBottom",
    ];
    for (const name of names) expect(() => navIcon(name), name).not.toThrow();
  });
});
