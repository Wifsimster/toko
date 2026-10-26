import { describe, expect, it } from "vitest";
import {
  dismissMoTip,
  localDayKey,
  MO_TIP_CONTEXTS,
  MO_TIPS,
  moTipOfTheDay,
  NO_MO_TIP_DISMISSALS,
  parseMoTipDismissals,
} from "../src/tips.ts";

// Midi, heure locale : loin de minuit, quel que soit le fuseau de la CI.
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

const allTips = MO_TIP_CONTEXTS.flatMap((c) => MO_TIPS[c]);

describe("MO_TIPS", () => {
  it("donne au moins un conseil à chaque contexte", () => {
    for (const context of MO_TIP_CONTEXTS) expect(MO_TIPS[context].length).toBeGreaterThan(0);
    expect(Object.keys(MO_TIPS).sort()).toEqual([...MO_TIP_CONTEXTS].sort());
  });

  it("a des ids uniques, préfixés par leur contexte", () => {
    const ids = allTips.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const context of MO_TIP_CONTEXTS) {
      for (const tip of MO_TIPS[context]) expect(tip.id.startsWith(`${context}-`)).toBe(true);
    }
  });

  it("garde 3 à 5 conseils courts pour les routines", () => {
    expect(MO_TIPS.routines.length).toBeGreaterThanOrEqual(3);
    expect(MO_TIPS.routines.length).toBeLessThanOrEqual(5);
  });

  it("reste court, au vouvoiement et sans tutoyer le parent", () => {
    for (const { text } of allTips) {
      expect(text.length).toBeLessThanOrEqual(140);
      // Le tutoiement n'est permis que dans une phrase citée, adressée à l'enfant.
      const outsideQuotes = text.replace(/«[^»]*»/g, "");
      expect(outsideQuotes).not.toMatch(/\b(tu|te|ton|ta|tes|toi)\b/i);
    }
  });

  it("n'accorde pas l'enfant au masculin ou au féminin", () => {
    for (const { text } of allTips) {
      expect(text).not.toMatch(/\b(tout seul|toute seule|lui-même|elle-même)\b/i);
    }
  });

  it("ne contient aucun emoji", () => {
    // Pas d'emoji générique dans l'interface : Mō, ses pictos et les icônes à la place.
    for (const { text } of allTips) expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it("n'utilise pas le lexique culpabilisant de la règle B7", () => {
    // Même liste que scripts/check-guilt-lexicon.mjs, qui ne lit que fr.json.
    const banned = /\b(oubli|retard|raté|rate|échec|faute|nul)\w*/iu;
    for (const { text } of allTips) expect(text.toLowerCase()).not.toMatch(banned);
  });
});

describe("moTipOfTheDay", () => {
  it("garde le même conseil toute la journée", () => {
    const morning = new Date(2026, 9, 26, 0, 1);
    const evening = new Date(2026, 9, 26, 23, 59);
    expect(moTipOfTheDay("home", morning)).toEqual(moTipOfTheDay("home", evening));
  });

  it("change de conseil à minuit et fait le tour de la liste", () => {
    const tips = MO_TIPS.journal;
    const seen = tips.map((_, i) => moTipOfTheDay("journal", day(2026, 3, 1 + i))?.id);
    expect(new Set(seen).size).toBe(tips.length);
    expect(moTipOfTheDay("journal", day(2026, 3, 1 + tips.length))).toEqual(
      moTipOfTheDay("journal", day(2026, 3, 1)),
    );
  });

  it("renvoie un conseil du contexte demandé", () => {
    for (const context of MO_TIP_CONTEXTS) {
      expect(MO_TIPS[context]).toContainEqual(moTipOfTheDay(context, day(2026, 10, 26)));
    }
  });

  it("saute les conseils masqués", () => {
    const now = day(2026, 10, 26);
    const first = moTipOfTheDay("rewards", now)!;
    const next = moTipOfTheDay("rewards", now, { ids: [first.id], hiddenOn: {} });
    expect(next).toBeDefined();
    expect(next!.id).not.toBe(first.id);
  });

  it("ne renvoie rien quand tous les conseils du contexte sont masqués", () => {
    const ids = MO_TIPS.barkley.map((t) => t.id);
    expect(moTipOfTheDay("barkley", day(2026, 10, 26), { ids, hiddenOn: {} })).toBeUndefined();
  });
});

describe("dismissMoTip", () => {
  const today = day(2026, 10, 26);
  const tomorrow = day(2026, 10, 27);

  it("masque le contexte jusqu'au lendemain, puis passe au conseil suivant", () => {
    const tip = moTipOfTheDay("symptoms", today)!;
    const after = dismissMoTip(NO_MO_TIP_DISMISSALS, "symptoms", tip.id, today);
    expect(moTipOfTheDay("symptoms", today, after)).toBeUndefined();
    const later = moTipOfTheDay("symptoms", tomorrow, after);
    expect(later).toBeDefined();
    expect(later!.id).not.toBe(tip.id);
  });

  it("masque le conseil pour de bon, comme le web", () => {
    const tip = MO_TIPS.journal[0]!;
    const after = dismissMoTip(NO_MO_TIP_DISMISSALS, "journal", tip.id, today);
    for (let i = 1; i <= 30; i++) {
      expect(moTipOfTheDay("journal", day(2026, 11, i), after)?.id).not.toBe(tip.id);
    }
  });

  it("ne touche pas aux autres contextes", () => {
    const after = dismissMoTip(NO_MO_TIP_DISMISSALS, "journal", MO_TIPS.journal[0]!.id, today);
    expect(moTipOfTheDay("rewards", today, after)).toEqual(moTipOfTheDay("rewards", today));
  });

  it("ne duplique pas un id déjà masqué et ne modifie pas l'état reçu", () => {
    const id = MO_TIPS.home[0]!.id;
    const once = dismissMoTip(NO_MO_TIP_DISMISSALS, "home", id, today);
    const twice = dismissMoTip(once, "home", id, tomorrow);
    expect(twice.ids).toEqual([id]);
    expect(once.hiddenOn.home).toBe("2026-10-26");
    expect(NO_MO_TIP_DISMISSALS).toEqual({ ids: [], hiddenOn: {} });
  });
});

describe("localDayKey", () => {
  it("donne le jour local AAAA-MM-JJ", () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(localDayKey(new Date(2026, 11, 31, 0, 0))).toBe("2026-12-31");
  });
});

describe("parseMoTipDismissals", () => {
  it("relit ce que dismissMoTip produit", () => {
    const state = dismissMoTip(NO_MO_TIP_DISMISSALS, "routines", MO_TIPS.routines[0]!.id, day(2026, 10, 26));
    expect(parseMoTipDismissals(JSON.stringify(state))).toEqual(state);
  });

  it("ignore un stockage vide, corrompu ou inattendu", () => {
    expect(parseMoTipDismissals(null)).toEqual(NO_MO_TIP_DISMISSALS);
    expect(parseMoTipDismissals("")).toEqual(NO_MO_TIP_DISMISSALS);
    expect(parseMoTipDismissals("{pas du json")).toEqual(NO_MO_TIP_DISMISSALS);
    expect(parseMoTipDismissals("42")).toEqual(NO_MO_TIP_DISMISSALS);
    expect(parseMoTipDismissals(JSON.stringify({ ids: ["a", 3], hiddenOn: { home: 1, journal: "2026-10-26", sos: "x" } }))).toEqual({
      ids: ["a"],
      hiddenOn: { journal: "2026-10-26" },
    });
  });
});
