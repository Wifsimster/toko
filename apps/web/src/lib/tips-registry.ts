/**
 * Discreet contextual tips shown across the app to help parents use features.
 * Each tip can be permanently dismissed (persisted in ui-store).
 * Based on Barkley PEHP principles and ADHD research.
 *
 * Tip content (text) is stored in i18n locale files under `tips.{id}`.
 * This registry holds only tip metadata (id + feature mapping).
 */

export type TipFeature =
  | "dashboard"
  | "symptoms"
  | "journal"
  | "crisis-list"
  | "rewards"
  | "barkley";

export interface Tip {
  id: string;
  feature: TipFeature;
}

export const TIPS: Tip[] = [
  // ─── Dashboard ──────────────────────────────────────
  { id: "dashboard-same-time-ritual", feature: "dashboard" },
  { id: "dashboard-celebrate-streak", feature: "dashboard" },
  { id: "dashboard-mood-conversation", feature: "dashboard" },

  // ─── Symptoms ───────────────────────────────────────
  { id: "symptoms-observe-not-judge", feature: "symptoms" },
  { id: "symptoms-context-matters", feature: "symptoms" },
  { id: "symptoms-with-child-from-8", feature: "symptoms" },

  // ─── Journal ────────────────────────────────────────
  { id: "journal-one-positive-daily", feature: "journal" },
  { id: "journal-describe-triggers", feature: "journal" },
  { id: "journal-short-is-enough", feature: "journal" },

  // ─── Crisis list ────────────────────────────────────
  { id: "crisis-build-when-calm", feature: "crisis-list" },
  { id: "crisis-test-before-crisis", feature: "crisis-list" },
  { id: "crisis-mix-sensory-types", feature: "crisis-list" },
  { id: "crisis-offer-not-impose", feature: "crisis-list" },
  { id: "crisis-stay-close", feature: "crisis-list" },

  // ─── Rewards / Barkley behaviors ────────────────────
  { id: "rewards-immediate-star", feature: "rewards" },
  { id: "rewards-never-remove", feature: "rewards" },
  { id: "rewards-start-small", feature: "rewards" },

  // ─── Barkley program ────────────────────────────────
  { id: "barkley-one-step-per-week", feature: "barkley" },
  { id: "barkley-special-time-first", feature: "barkley" },
];

export function getTipsByFeature(feature: TipFeature): Tip[] {
  return TIPS.filter((t) => t.feature === feature);
}
