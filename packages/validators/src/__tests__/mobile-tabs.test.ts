import { describe, expect, it } from "vitest";
import {
  DEFAULT_MOBILE_TABS,
  checkMobileTabsSaved,
  serverMobileTabs,
  MOBILE_TAB_IDS,
  isDefaultMobileTabs,
  mobileTabsSchema,
  normalizeMobileTabs,
  moveMobileTab,
  moveMobileTabTo,
  pickMobileTabs,
  resolveMobileTabs,
  toggleMobileTab,
} from "../mobile-tabs";
import { updateUserPreferencesSchema } from "../user-preferences";

describe("mobileTabsSchema", () => {
  it("accepts 1 or 2 known, distinct ids", () => {
    expect(mobileTabsSchema.safeParse(["insights"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["timer", "articles"]).success).toBe(true);
  });

  it("rejects an empty list and more than 3 tabs, and still accepts the 3 tabs an older app sends", () => {
    expect(mobileTabsSchema.safeParse([]).success).toBe(false);
    expect(mobileTabsSchema.safeParse(["timer", "articles", "symptoms"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["timer", "articles", "symptoms", "report"]).success).toBe(false);
  });

  it("accepts every destination that exists today, the Suivi hub and the account included", () => {
    expect(mobileTabsSchema.safeParse(["suivi", "account"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["barkley", "medications"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["report", "crisis"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["rewards", "insights"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["lexicon", "articles"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["timer", "routines"]).success).toBe(true);
    expect(MOBILE_TAB_IDS).toEqual([
      "suivi",
      "barkley",
      "account",
      "report",
      "articles",
      "lexicon",
      "symptoms",
      "medications",
      "routines",
      "rewards",
      "timer",
      "insights",
      "crisis",
    ]);
  });

  it("rejects unknown ids, the fixed ends and the screens that are not destinations", () => {
    expect(mobileTabsSchema.safeParse(["articles", "nope"]).success).toBe(false);
    expect(mobileTabsSchema.safeParse(["home"]).success).toBe(false);
    expect(mobileTabsSchema.safeParse(["plus"]).success).toBe(false);
    for (const id of ["settings", "menuBar", "discord", "quiz", "calm", "journal"]) {
      expect(mobileTabsSchema.safeParse([id]).success).toBe(false);
    }
  });

  it("rejects duplicates", () => {
    expect(mobileTabsSchema.safeParse(["routines", "routines"]).success).toBe(false);
  });

  it("is optional and nullable in the preferences PATCH", () => {
    expect(updateUserPreferencesSchema.safeParse({}).success).toBe(true);
    expect(updateUserPreferencesSchema.safeParse({ mobileTabs: null }).success).toBe(true);
    expect(
      updateUserPreferencesSchema.safeParse({ mobileTabs: ["insights", "timer"] }).success,
    ).toBe(true);
    expect(updateUserPreferencesSchema.safeParse({ mobileTabs: ["x"] }).success).toBe(false);
  });
});

describe("resolveMobileTabs", () => {
  it("defaults to Suivi and Barkley, like the web, Compte living in Plus", () => {
    expect(DEFAULT_MOBILE_TABS).toEqual(["suivi", "barkley"]);
    expect(resolveMobileTabs(null)).toEqual(["suivi", "barkley"]);
    expect(resolveMobileTabs(undefined)).toEqual(["suivi", "barkley"]);
  });

  it("reads the old Journal tab as Suivi, which now opens the journal", () => {
    expect(resolveMobileTabs(["journal", "timer"])).toEqual(["suivi", "timer"]);
    expect(resolveMobileTabs(["suivi", "journal"])).toEqual(["suivi"]);
    expect(normalizeMobileTabs(["journal", "barkley"])).toBeNull();
  });

  it("keeps the first two tabs of a three-tab bar saved before SOS took the centre", () => {
    expect(resolveMobileTabs(["articles", "barkley", "timer"])).toEqual(["articles", "barkley"]);
    expect(resolveMobileTabs(["suivi", "barkley", "account"])).toEqual(["suivi", "barkley"]);
    expect(normalizeMobileTabs(["crisis", "rewards", "barkley"])).toEqual(["crisis", "rewards", "barkley"]);
    expect(
      pickMobileTabs({ userId: "u1", server: undefined, cached: { userId: "u1", tabs: ["report", "timer", "lexicon"] } }),
    ).toEqual(["report", "timer"]);
  });

  it("keeps a valid stored order", () => {
    expect(resolveMobileTabs(["symptoms", "insights"])).toEqual(["symptoms", "insights"]);
  });

  it("ignores unknown ids (newer app version) and keeps the rest", () => {
    expect(resolveMobileTabs(["future-tab", "insights", 42])).toEqual(["insights"]);
    expect(resolveMobileTabs(["settings", "crisis", "rewards"])).toEqual(["crisis", "rewards"]);
    expect(resolveMobileTabs(["sos", "timer"])).toEqual(["timer"]);
  });

  it("drops a removed tab id still stored by an older version", () => {
    expect(mobileTabsSchema.safeParse(["calm"]).success).toBe(false);
    expect(resolveMobileTabs(["calm", "insights"])).toEqual(["insights"]);
    expect(resolveMobileTabs(["calm"])).toEqual(DEFAULT_MOBILE_TABS);
    expect(
      pickMobileTabs({ userId: "u1", server: undefined, cached: { userId: "u1", tabs: ["calm", "timer"] } }),
    ).toEqual(["timer"]);
  });

  it("never lets the fixed ends into the middle", () => {
    expect(resolveMobileTabs(["home", "timer", "plus"])).toEqual(["timer"]);
  });

  it("drops duplicates and caps at 2", () => {
    expect(
      resolveMobileTabs(["timer", "timer", "insights", "articles", "routines"]),
    ).toEqual(["timer", "insights"]);
  });

  it("falls back to the default when nothing usable remains", () => {
    expect(resolveMobileTabs([])).toEqual(DEFAULT_MOBILE_TABS);
    expect(resolveMobileTabs(["unknown"])).toEqual(DEFAULT_MOBILE_TABS);
    expect(resolveMobileTabs("articles")).toEqual(DEFAULT_MOBILE_TABS);
    expect(resolveMobileTabs({ tabs: ["timer"] })).toEqual(DEFAULT_MOBILE_TABS);
  });

  it("returns a fresh array (callers may mutate it)", () => {
    const a = resolveMobileTabs(null);
    a.push("insights");
    expect(DEFAULT_MOBILE_TABS).toHaveLength(2);
  });
});

describe("serverMobileTabs", () => {
  it("reads a missing field (older API) as unknown, so the local cache stays", () => {
    const server = serverMobileTabs({ userId: "u1", timezone: "Europe/Paris" });
    expect(server).toBeUndefined();
    expect(
      pickMobileTabs({ userId: "u1", server, cached: { userId: "u1", tabs: ["crisis"] } }),
    ).toEqual(["crisis"]);
  });

  it("reads an explicit null as the default bar, even over a cache", () => {
    const server = serverMobileTabs({ userId: "u1", mobileTabs: null });
    expect(server).toBeNull();
    expect(
      pickMobileTabs({ userId: "u1", server, cached: { userId: "u1", tabs: ["crisis"] } }),
    ).toEqual(DEFAULT_MOBILE_TABS);
  });

  it("passes a stored list through", () => {
    expect(serverMobileTabs({ mobileTabs: ["insights"] })).toEqual(["insights"]);
  });
});

describe("checkMobileTabsSaved", () => {
  it("flags an API that dropped the field (200 without mobileTabs)", () => {
    expect(checkMobileTabsSaved(["crisis", "insights"], { userId: "u1" })).toEqual({
      ok: false,
      reason: "unsupported",
    });
    expect(checkMobileTabsSaved(null, { userId: "u1" })).toEqual({
      ok: false,
      reason: "unsupported",
    });
    expect(checkMobileTabsSaved(["insights"], null)).toEqual({ ok: false, reason: "unsupported" });
  });

  it("accepts the same list, in the same order", () => {
    expect(
      checkMobileTabsSaved(["crisis", "insights"], { mobileTabs: ["crisis", "insights"] }),
    ).toEqual({ ok: true, tabs: ["crisis", "insights"] });
  });

  it("accepts null for null (back to the default bar)", () => {
    expect(checkMobileTabsSaved(null, { mobileTabs: null })).toEqual({ ok: true, tabs: null });
  });

  it("rejects a different answer: other order, null for a list, a list for null", () => {
    const mismatch = { ok: false, reason: "mismatch" };
    expect(
      checkMobileTabsSaved(["crisis", "insights"], { mobileTabs: ["insights", "crisis"] }),
    ).toEqual(mismatch);
    expect(checkMobileTabsSaved(["crisis"], { mobileTabs: null })).toEqual(mismatch);
    expect(checkMobileTabsSaved(null, { mobileTabs: ["crisis"] })).toEqual(mismatch);
    expect(checkMobileTabsSaved(["crisis"], { mobileTabs: ["crisis", "insights"] })).toEqual(
      mismatch,
    );
  });
});

describe("pickMobileTabs", () => {
  const cached = { userId: "u1", tabs: ["insights", "symptoms"] };

  it("prefers the server value once known", () => {
    expect(pickMobileTabs({ userId: "u1", server: ["timer"], cached })).toEqual(["timer"]);
    expect(pickMobileTabs({ userId: "u1", server: null, cached })).toEqual(DEFAULT_MOBILE_TABS);
  });

  it("uses the same account's cache while the server is unknown (startup, offline)", () => {
    expect(pickMobileTabs({ userId: "u1", server: undefined, cached })).toEqual([
      "insights",
      "symptoms",
    ]);
  });

  it("ignores a cache written by another account", () => {
    expect(pickMobileTabs({ userId: "u2", server: undefined, cached })).toEqual(
      DEFAULT_MOBILE_TABS,
    );
    expect(pickMobileTabs({ userId: null, server: undefined, cached })).toEqual(
      DEFAULT_MOBILE_TABS,
    );
  });

  it("sanitizes a corrupt cache", () => {
    expect(
      pickMobileTabs({ userId: "u1", server: undefined, cached: { userId: "u1", tabs: "x" } }),
    ).toEqual(DEFAULT_MOBILE_TABS);
  });

  it("falls back to the default with no cache", () => {
    expect(pickMobileTabs({ userId: "u1", server: undefined, cached: null })).toEqual(
      DEFAULT_MOBILE_TABS,
    );
  });
});

describe("toggleMobileTab / moveMobileTab", () => {
  it("adds at the end and removes", () => {
    expect(toggleMobileTab(["articles"], "insights")).toEqual(["articles", "insights"]);
    expect(toggleMobileTab(["articles", "insights"], "articles")).toEqual(["insights"]);
  });

  it("keeps at least 1 and at most 2 tabs", () => {
    expect(toggleMobileTab(["timer"], "timer")).toEqual(["timer"]);
    expect(toggleMobileTab(["articles", "routines"], "insights")).toEqual(["articles", "routines"]);
  });

  it("moves one step and stays in bounds", () => {
    expect(moveMobileTab(["articles", "routines", "timer"], "timer", -1)).toEqual([
      "articles",
      "timer",
      "routines",
    ]);
    expect(moveMobileTab(["articles", "routines"], "articles", 1)).toEqual([
      "routines",
      "articles",
    ]);
    expect(moveMobileTab(["articles", "routines"], "articles", -1)).toEqual([
      "articles",
      "routines",
    ]);
    expect(moveMobileTab(["articles"], "insights", 1)).toEqual(["articles"]);
  });

  it("drags a tab to any position and shifts the others", () => {
    const tabs = ["articles", "routines", "timer"] as const;
    expect(moveMobileTabTo(tabs, "articles", 2)).toEqual(["routines", "timer", "articles"]);
    expect(moveMobileTabTo(tabs, "timer", 0)).toEqual(["timer", "articles", "routines"]);
    expect(moveMobileTabTo(tabs, "routines", 1)).toEqual([...tabs]);
  });

  it("clamps a drag past either end, ignores unknown ids and NaN", () => {
    const tabs = ["articles", "routines", "timer"] as const;
    expect(moveMobileTabTo(tabs, "routines", 7)).toEqual(["articles", "timer", "routines"]);
    expect(moveMobileTabTo(tabs, "routines", -3)).toEqual(["routines", "articles", "timer"]);
    expect(moveMobileTabTo(tabs, "routines", Number.NaN)).toEqual([...tabs]);
    expect(moveMobileTabTo(tabs, "insights", 0)).toEqual([...tabs]);
  });

  it("every result of toggle/move stays valid for the API", () => {
    let tabs = [...DEFAULT_MOBILE_TABS];
    for (const id of MOBILE_TAB_IDS) {
      tabs = toggleMobileTab(tabs, id);
      expect(mobileTabsSchema.safeParse(tabs).success).toBe(true);
      tabs = moveMobileTab(tabs, tabs[0]!, 1);
      expect(mobileTabsSchema.safeParse(tabs).success).toBe(true);
    }
  });

  it("detects the default bar", () => {
    expect(isDefaultMobileTabs(["suivi", "barkley"])).toBe(true);
    expect(isDefaultMobileTabs(["barkley", "suivi"])).toBe(false);
    expect(isDefaultMobileTabs(["suivi", "barkley", "account"])).toBe(false);
    expect(isDefaultMobileTabs(["articles", "routines"])).toBe(false);
  });
});

describe("normalizeMobileTabs", () => {
  it("stores the default bar as null", () => {
    expect(normalizeMobileTabs(["suivi", "barkley"])).toBeNull();
    expect(normalizeMobileTabs(null)).toBeNull();
    expect(normalizeMobileTabs(undefined)).toBeNull();
  });

  it("drops stale and unknown ids instead of echoing them", () => {
    expect(normalizeMobileTabs(["calm", "insights", "future-tab"])).toEqual(["insights"]);
    expect(normalizeMobileTabs(["calm"])).toBeNull();
    expect(normalizeMobileTabs("insights")).toBeNull();
  });

  it("keeps a custom order and caps it", () => {
    expect(normalizeMobileTabs(["account", "lexicon"])).toEqual(["account", "lexicon"]);
    expect(normalizeMobileTabs(["timer", "timer", "crisis", "suivi", "report"])).toEqual([
      "timer",
      "crisis",
      "suivi",
    ]);
  });

  it("always gives a value the PATCH schema accepts", () => {
    for (const input of [null, [], ["calm"], ["insights", "insights"], ["suivi", "barkley", "account", "report"]]) {
      expect(updateUserPreferencesSchema.safeParse({ mobileTabs: normalizeMobileTabs(input) }).success).toBe(true);
    }
  });
});
