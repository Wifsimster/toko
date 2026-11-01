import { describe, expect, it } from "vitest";
import {
  SETUP_NEED_IDS,
  SETUP_NEED_TABS,
  isSetupNeedId,
  rankSetupTabs,
  setupOffer,
  suggestMobileTabs,
  toggleSetupNeed,
} from "../mobile-setup";
import { DEFAULT_MOBILE_TABS, MOBILE_TAB_IDS, mobileTabsSchema } from "../mobile-tabs";

describe("SETUP_NEED_TABS", () => {
  it("maps every need to at least one known tab, without duplicates", () => {
    for (const need of SETUP_NEED_IDS) {
      const tabs = SETUP_NEED_TABS[need];
      expect(tabs.length).toBeGreaterThan(0);
      expect(new Set(tabs).size).toBe(tabs.length);
      for (const tab of tabs) expect(MOBILE_TAB_IDS).toContain(tab);
    }
  });

  it("never suggests the account tab from a need", () => {
    for (const need of SETUP_NEED_IDS) expect(SETUP_NEED_TABS[need]).not.toContain("account");
  });
});

describe("isSetupNeedId", () => {
  it("accepts known needs only", () => {
    expect(isSetupNeedId("journal")).toBe(true);
    expect(isSetupNeedId("account")).toBe(false);
    expect(isSetupNeedId(3)).toBe(false);
  });
});

describe("toggleSetupNeed", () => {
  it("adds and removes a need", () => {
    expect(toggleSetupNeed([], "crisis")).toEqual(["crisis"]);
    expect(toggleSetupNeed(["crisis"], "crisis")).toEqual([]);
  });

  it("keeps the catalogue order whatever the tap order", () => {
    expect(toggleSetupNeed(["timer"], "journal")).toEqual(["journal", "timer"]);
  });
});

describe("rankSetupTabs", () => {
  it("returns nothing without needs", () => {
    expect(rankSetupTabs([])).toEqual([]);
  });

  it("ranks the main tab of a need before its extra tab", () => {
    expect(rankSetupTabs(["symptoms"])).toEqual(["symptoms", "insights"]);
  });

  it("adds up a tab asked for by several needs", () => {
    expect(rankSetupTabs(["barkley", "rewards"])).toEqual(["rewards", "barkley"]);
    expect(rankSetupTabs(["symptoms", "doctor"])).toEqual(["symptoms", "insights", "report"]);
  });

  it("breaks ties with the catalogue order of the needs", () => {
    expect(rankSetupTabs(["crisis", "journal", "medications"])).toEqual([
      "suivi",
      "medications",
      "crisis",
    ]);
  });

  it("lists each tab once", () => {
    const all = rankSetupTabs([...SETUP_NEED_IDS]);
    expect(new Set(all).size).toBe(all.length);
    expect(all).not.toContain("account");
  });
});

describe("suggestMobileTabs", () => {
  it("keeps the default bar without needs", () => {
    expect(suggestMobileTabs([])).toEqual([...DEFAULT_MOBILE_TABS]);
  });

  it("keeps the three best tabs", () => {
    expect(suggestMobileTabs(["symptoms", "routines", "barkley", "learn"])).toEqual([
      "symptoms",
      "routines",
      "barkley",
    ]);
  });

  it("fills free places with the default tabs", () => {
    expect(suggestMobileTabs(["timer"])).toEqual(["timer", "suivi", "barkley"]);
    expect(suggestMobileTabs(["journal"])).toEqual(["suivi", "barkley", "account"]);
    expect(suggestMobileTabs(["barkley"])).toEqual(["barkley", "rewards", "suivi"]);
  });

  it("always gives a bar the server accepts", () => {
    const needs = [...SETUP_NEED_IDS];
    for (let mask = 1; mask < 1 << needs.length; mask += 37) {
      const picked = needs.filter((_, i) => mask & (1 << i));
      expect(mobileTabsSchema.safeParse(suggestMobileTabs(picked)).success).toBe(true);
    }
  });
});

describe("setupOffer", () => {
  it("waits for the local flag", () => {
    expect(setupOffer({ seen: undefined, settled: true, server: null })).toBe("wait");
  });

  it("never comes back once seen", () => {
    expect(setupOffer({ seen: true, settled: true, server: null })).toBe("never");
  });

  it("waits for the server answer", () => {
    expect(setupOffer({ seen: false, settled: false, server: undefined })).toBe("wait");
  });

  it("offers the wizard when the account still has the default bar", () => {
    expect(setupOffer({ seen: false, settled: true, server: null })).toBe("offer");
  });

  it("never offers it to an account that already chose a bar", () => {
    expect(setupOffer({ seen: false, settled: true, server: ["timer"] })).toBe("never");
  });

  it("asks again later when the server answer is unknown", () => {
    expect(setupOffer({ seen: false, settled: true, server: undefined })).toBe("later");
  });
});
