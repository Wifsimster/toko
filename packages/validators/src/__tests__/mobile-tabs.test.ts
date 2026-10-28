import { describe, expect, it } from "vitest";
import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TAB_IDS,
  isDefaultMobileTabs,
  mobileTabsSchema,
  moveMobileTab,
  moveMobileTabTo,
  pickMobileTabs,
  resolveMobileTabs,
  toggleMobileTab,
} from "../mobile-tabs";
import { updateUserPreferencesSchema } from "../user-preferences";

describe("mobileTabsSchema", () => {
  it("accepts 1 to 3 known, distinct ids", () => {
    expect(mobileTabsSchema.safeParse(["journal"]).success).toBe(true);
    expect(mobileTabsSchema.safeParse(["timer", "articles", "symptoms"]).success).toBe(true);
  });

  it("rejects an empty list and more than 3 tabs", () => {
    expect(mobileTabsSchema.safeParse([]).success).toBe(false);
    expect(
      mobileTabsSchema.safeParse(["articles", "routines", "timer", "journal"]).success,
    ).toBe(false);
  });

  it("rejects unknown ids, including the fixed ends", () => {
    expect(mobileTabsSchema.safeParse(["articles", "nope"]).success).toBe(false);
    expect(mobileTabsSchema.safeParse(["home"]).success).toBe(false);
    expect(mobileTabsSchema.safeParse(["plus"]).success).toBe(false);
  });

  it("rejects duplicates", () => {
    expect(mobileTabsSchema.safeParse(["routines", "routines"]).success).toBe(false);
  });

  it("is optional and nullable in the preferences PATCH", () => {
    expect(updateUserPreferencesSchema.safeParse({}).success).toBe(true);
    expect(updateUserPreferencesSchema.safeParse({ mobileTabs: null }).success).toBe(true);
    expect(
      updateUserPreferencesSchema.safeParse({ mobileTabs: ["journal", "timer"] }).success,
    ).toBe(true);
    expect(updateUserPreferencesSchema.safeParse({ mobileTabs: ["x"] }).success).toBe(false);
  });
});

describe("resolveMobileTabs", () => {
  it("defaults to Articles, Routines, Minuteur", () => {
    expect(DEFAULT_MOBILE_TABS).toEqual(["articles", "routines", "timer"]);
    expect(resolveMobileTabs(null)).toEqual(["articles", "routines", "timer"]);
    expect(resolveMobileTabs(undefined)).toEqual(["articles", "routines", "timer"]);
  });

  it("keeps a valid stored order", () => {
    expect(resolveMobileTabs(["symptoms", "journal"])).toEqual(["symptoms", "journal"]);
  });

  it("ignores unknown ids (newer app version) and keeps the rest", () => {
    expect(resolveMobileTabs(["future-tab", "journal", 42])).toEqual(["journal"]);
  });

  it("never lets the fixed ends into the middle", () => {
    expect(resolveMobileTabs(["home", "timer", "plus"])).toEqual(["timer"]);
  });

  it("drops duplicates and caps at 3", () => {
    expect(
      resolveMobileTabs(["timer", "timer", "journal", "articles", "routines"]),
    ).toEqual(["timer", "journal", "articles"]);
  });

  it("falls back to the default when nothing usable remains", () => {
    expect(resolveMobileTabs([])).toEqual(DEFAULT_MOBILE_TABS);
    expect(resolveMobileTabs(["unknown"])).toEqual(DEFAULT_MOBILE_TABS);
    expect(resolveMobileTabs("articles")).toEqual(DEFAULT_MOBILE_TABS);
    expect(resolveMobileTabs({ tabs: ["timer"] })).toEqual(DEFAULT_MOBILE_TABS);
  });

  it("returns a fresh array (callers may mutate it)", () => {
    const a = resolveMobileTabs(null);
    a.push("journal");
    expect(DEFAULT_MOBILE_TABS).toHaveLength(3);
  });
});

describe("pickMobileTabs", () => {
  const cached = { userId: "u1", tabs: ["journal", "symptoms"] };

  it("prefers the server value once known", () => {
    expect(pickMobileTabs({ userId: "u1", server: ["timer"], cached })).toEqual(["timer"]);
    expect(pickMobileTabs({ userId: "u1", server: null, cached })).toEqual(DEFAULT_MOBILE_TABS);
  });

  it("uses the same account's cache while the server is unknown (startup, offline)", () => {
    expect(pickMobileTabs({ userId: "u1", server: undefined, cached })).toEqual([
      "journal",
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
    expect(toggleMobileTab(["articles"], "journal")).toEqual(["articles", "journal"]);
    expect(toggleMobileTab(["articles", "journal"], "articles")).toEqual(["journal"]);
  });

  it("keeps at least 1 and at most 3 tabs", () => {
    expect(toggleMobileTab(["timer"], "timer")).toEqual(["timer"]);
    expect(toggleMobileTab(["articles", "routines", "timer"], "journal")).toEqual([
      "articles",
      "routines",
      "timer",
    ]);
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
    expect(moveMobileTab(["articles"], "journal", 1)).toEqual(["articles"]);
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
    expect(moveMobileTabTo(tabs, "journal", 0)).toEqual([...tabs]);
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
    expect(isDefaultMobileTabs(["articles", "routines", "timer"])).toBe(true);
    expect(isDefaultMobileTabs(["routines", "articles", "timer"])).toBe(false);
  });
});
