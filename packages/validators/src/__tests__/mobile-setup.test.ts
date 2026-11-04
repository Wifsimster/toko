import { describe, expect, it } from "vitest";
import {
  SETUP_THEME_IDS,
  SETUP_THEME_TABS,
  isSetupThemeId,
  setupThemeTabs,
  shouldOfferWizard,
} from "../mobile-setup";
import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TABS_MAX,
  mobileTabsSchema,
  normalizeMobileTabs,
} from "../mobile-tabs";

describe("SETUP_THEME_TABS", () => {
  it("gives every theme a full bar the server accepts as a custom bar", () => {
    for (const theme of SETUP_THEME_IDS) {
      const tabs = SETUP_THEME_TABS[theme];
      expect(tabs).toHaveLength(MOBILE_TABS_MAX);
      expect(mobileTabsSchema.safeParse(tabs).success).toBe(true);
      expect(normalizeMobileTabs(tabs)).toEqual([...tabs]);
    }
  });

  it("never puts the account tab in a theme", () => {
    for (const theme of SETUP_THEME_IDS) expect(SETUP_THEME_TABS[theme]).not.toContain("account");
  });

  it("gives each theme its own bar", () => {
    const bars = SETUP_THEME_IDS.map((theme) => SETUP_THEME_TABS[theme].join(","));
    expect(new Set(bars).size).toBe(bars.length);
  });
});

describe("isSetupThemeId", () => {
  it("accepts known themes only", () => {
    expect(isSetupThemeId("medical")).toBe(true);
    expect(isSetupThemeId("unsure")).toBe(false);
    expect(isSetupThemeId("suivi")).toBe(false);
    expect(isSetupThemeId(3)).toBe(false);
  });
});

describe("setupThemeTabs", () => {
  it("preselects the tabs of the chosen theme, in order", () => {
    expect(setupThemeTabs("daily")).toEqual(["routines", "suivi"]);
    expect(setupThemeTabs("barkley")).toEqual(["barkley", "rewards"]);
    expect(setupThemeTabs("learn")).toEqual(["articles", "lexicon"]);
    expect(setupThemeTabs("medical")).toEqual(["symptoms", "medications"]);
  });

  it("keeps the default bar without a theme", () => {
    expect(setupThemeTabs(null)).toEqual([...DEFAULT_MOBILE_TABS]);
    expect(setupThemeTabs(undefined)).toEqual([...DEFAULT_MOBILE_TABS]);
  });

  it("returns a fresh bar the wizard can edit", () => {
    const bar = setupThemeTabs("daily");
    bar.pop();
    expect(SETUP_THEME_TABS.daily).toHaveLength(MOBILE_TABS_MAX);
    expect(setupThemeTabs("daily")).toHaveLength(MOBILE_TABS_MAX);
  });
});

describe("shouldOfferWizard", () => {
  const base = {
    userId: "u1",
    seen: false,
    openedFromLink: false,
    interrupted: false,
    late: false,
    settled: true,
    prefs: { userId: "u1", mobileTabs: null },
  };

  it("offers the wizard to an account that still has the default bar", () => {
    expect(shouldOfferWizard(base)).toBe("offer");
  });

  it("never offers it to an account that already chose a bar", () => {
    expect(shouldOfferWizard({ ...base, prefs: { userId: "u1", mobileTabs: ["timer"] } })).toBe(
      "never",
    );
  });

  it("never comes back once seen", () => {
    expect(shouldOfferWizard({ ...base, seen: true })).toBe("never");
  });

  it("waits for the local flag, the launch link check and the server", () => {
    expect(shouldOfferWizard({ ...base, seen: undefined })).toBe("wait");
    expect(shouldOfferWizard({ ...base, openedFromLink: undefined })).toBe("wait");
    expect(shouldOfferWizard({ ...base, settled: false, prefs: undefined })).toBe("wait");
  });

  it("gives up for this launch when the answer comes late", () => {
    expect(shouldOfferWizard({ ...base, late: true })).toBe("later");
    expect(shouldOfferWizard({ ...base, settled: false, late: true })).toBe("later");
    expect(shouldOfferWizard({ ...base, seen: undefined, late: true })).toBe("later");
  });

  it("still marks an account with a custom bar when the answer comes late", () => {
    expect(
      shouldOfferWizard({ ...base, late: true, prefs: { userId: "u1", mobileTabs: ["timer"] } }),
    ).toBe("never");
  });

  it("waits for the next launch when the app was opened from a link or a notification", () => {
    expect(shouldOfferWizard({ ...base, openedFromLink: true })).toBe("later");
    expect(shouldOfferWizard({ ...base, interrupted: true })).toBe("later");
    expect(
      shouldOfferWizard({
        ...base,
        openedFromLink: true,
        prefs: { userId: "u1", mobileTabs: ["timer"] },
      }),
    ).toBe("later");
  });

  it("ignores preferences cached for another account", () => {
    expect(shouldOfferWizard({ ...base, prefs: { userId: "u2", mobileTabs: null } })).toBe("later");
    expect(
      shouldOfferWizard({ ...base, prefs: { userId: "u2", mobileTabs: ["timer"] } }),
    ).toBe("later");
  });

  it("waits for the next launch when the server answer is missing or unknown", () => {
    expect(shouldOfferWizard({ ...base, prefs: undefined })).toBe("later");
    expect(shouldOfferWizard({ ...base, prefs: { userId: "u1" } })).toBe("later");
    expect(shouldOfferWizard({ ...base, userId: undefined })).toBe("later");
  });
});
