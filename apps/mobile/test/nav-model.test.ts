import { describe, expect, it } from "vitest";
import fr from "../../web/src/lib/i18n/locales/fr.json";
import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TAB_IDS,
  MORE_ENTRIES,
  MORE_GROUPS,
  PRIMARY_NAV,
  normalizeMobileTabs,
  resolveMobileTabs,
  toggleMobileTab,
  type MobileTabId,
} from "@focusflow/validators";
import { nav, plus } from "../src/lib/copy";
import { navIcon } from "../src/navigation/nav-icons";
import {
  MIDDLE_TAB_ROUTES,
  PLUS_GROUPS,
  TAB_DEFS,
  bottomBar,
  hiddenTabRoutes,
  sectionTarget,
} from "../src/navigation/nav-model";

const PRESETS: MobileTabId[][] = [
  [...DEFAULT_MOBILE_TABS],
  ["symptoms"],
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
    expect(bottomBar().slice(0, -1).map((t) => [t.title, t.icon])).toEqual(
      PRIMARY_NAV.map((i) => [nav.labels[i.shortLabelKey], i.icon]),
    );
    expect(bottomBar(DEFAULT_MOBILE_TABS)).toEqual(bottomBar());
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
      "MinuteurTab",
      "PlusTab",
    ]);
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
    expect(bottomBar(resolveMobileTabs(["calm", "symptoms", "quiz"])).map((t) => t.route)).toEqual([
      "AccueilTab",
      "SymptomesTab",
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

  it("le choix ne dépasse jamais trois onglets entre Accueil et Plus", () => {
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
    expect(bottomBar(["symptoms", "medications", "rewards"]).map((t) => t.title)).toEqual([
      "Accueil",
      "Symptômes",
      "Traitements",
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
