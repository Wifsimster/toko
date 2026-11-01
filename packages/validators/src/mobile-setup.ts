import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TABS_MAX,
  type MobileTabId,
} from "./mobile-tabs";

export const SETUP_NEED_IDS = [
  "journal",
  "symptoms",
  "routines",
  "barkley",
  "rewards",
  "medications",
  "doctor",
  "learn",
  "crisis",
  "timer",
] as const;

export type SetupNeedId = (typeof SETUP_NEED_IDS)[number];

export const SETUP_NEED_TABS: Record<SetupNeedId, readonly MobileTabId[]> = {
  journal: ["suivi"],
  symptoms: ["symptoms", "insights"],
  routines: ["routines", "timer"],
  barkley: ["barkley", "rewards"],
  rewards: ["rewards"],
  medications: ["medications"],
  doctor: ["report", "insights"],
  learn: ["articles", "lexicon"],
  crisis: ["crisis"],
  timer: ["timer"],
};

const PRIMARY_WEIGHT = 2;
const SECONDARY_WEIGHT = 1;

export function isSetupNeedId(value: unknown): value is SetupNeedId {
  return (
    typeof value === "string" &&
    (SETUP_NEED_IDS as readonly string[]).includes(value)
  );
}

export function toggleSetupNeed(
  needs: readonly SetupNeedId[],
  id: SetupNeedId,
): SetupNeedId[] {
  const next = needs.includes(id) ? needs.filter((n) => n !== id) : [...needs, id];
  return SETUP_NEED_IDS.filter((n) => next.includes(n));
}

export function rankSetupTabs(needs: readonly SetupNeedId[]): MobileTabId[] {
  const scores = new Map<MobileTabId, number>();
  for (const need of SETUP_NEED_IDS) {
    if (!needs.includes(need)) continue;
    SETUP_NEED_TABS[need].forEach((tab, i) => {
      const weight = i === 0 ? PRIMARY_WEIGHT : SECONDARY_WEIGHT;
      scores.set(tab, (scores.get(tab) ?? 0) + weight);
    });
  }
  const seen = [...scores.keys()];
  return seen.sort(
    (a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || seen.indexOf(a) - seen.indexOf(b),
  );
}

export function suggestMobileTabs(needs: readonly SetupNeedId[]): MobileTabId[] {
  const out = rankSetupTabs(needs).slice(0, MOBILE_TABS_MAX);
  if (!out.length) return [...DEFAULT_MOBILE_TABS];
  for (const tab of DEFAULT_MOBILE_TABS) {
    if (out.length >= MOBILE_TABS_MAX) break;
    if (!out.includes(tab)) out.push(tab);
  }
  return out;
}

export type SetupOffer = "wait" | "offer" | "later" | "never";

export function setupOffer(input: {
  seen: boolean | undefined;
  settled: boolean;
  server: unknown;
}): SetupOffer {
  if (input.seen === undefined) return "wait";
  if (input.seen) return "never";
  if (!input.settled) return "wait";
  if (input.server === null) return "offer";
  if (Array.isArray(input.server)) return "never";
  return "later";
}
