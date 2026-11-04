import {
  DEFAULT_MOBILE_TABS,
  resolveMobileTabs,
  type MobileTabId,
} from "./mobile-tabs";

export const SETUP_THEME_IDS = ["daily", "barkley", "learn", "medical"] as const;

export type SetupThemeId = (typeof SETUP_THEME_IDS)[number];

export const SETUP_THEME_TABS: Record<SetupThemeId, readonly MobileTabId[]> = {
  daily: ["routines", "suivi"],
  barkley: ["barkley", "rewards"],
  learn: ["articles", "lexicon"],
  medical: ["symptoms", "medications"],
};

export function isSetupThemeId(value: unknown): value is SetupThemeId {
  return (
    typeof value === "string" &&
    (SETUP_THEME_IDS as readonly string[]).includes(value)
  );
}

export function setupThemeTabs(theme: SetupThemeId | null | undefined): MobileTabId[] {
  if (!theme) return [...DEFAULT_MOBILE_TABS];
  return resolveMobileTabs(SETUP_THEME_TABS[theme]);
}

export type SetupOffer = "wait" | "offer" | "later" | "never";

export function shouldOfferWizard(input: {
  userId: string | null | undefined;
  seen: boolean | undefined;
  openedFromLink: boolean | undefined;
  interrupted: boolean;
  late: boolean;
  settled: boolean;
  prefs: unknown;
}): SetupOffer {
  if (!input.userId) return "later";
  if (input.seen === undefined) return input.late ? "later" : "wait";
  if (input.seen) return "never";
  if (input.openedFromLink || input.interrupted) return "later";
  if (input.openedFromLink === undefined || !input.settled) {
    return input.late ? "later" : "wait";
  }
  const prefs = input.prefs;
  if (typeof prefs !== "object" || prefs === null) return "later";
  if ((prefs as { userId?: unknown }).userId !== input.userId) return "later";
  if (!("mobileTabs" in prefs)) return "later";
  const tabs = (prefs as { mobileTabs: unknown }).mobileTabs;
  if (Array.isArray(tabs)) return "never";
  if (tabs !== null) return "later";
  return input.late ? "later" : "offer";
}
