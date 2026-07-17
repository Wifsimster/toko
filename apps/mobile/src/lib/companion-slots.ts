import type { TimeOfDay } from "@focusflow/validators";

/**
 * The Phase 4 companion splits the day in two tabs: Matin covers the first
 * half, Soir the second. A routine's `timeOfDay` is mapped to a slot below so
 * nothing is ever invisible — `noon` falls under Matin, `bedtime` under Soir,
 * and `anytime` (no fixed moment) surfaces in both.
 */
export type CompanionSlot = "morning" | "evening";

export const SLOT_TIME_OF_DAY: Record<CompanionSlot, ReadonlySet<TimeOfDay>> = {
  morning: new Set<TimeOfDay>(["morning", "noon", "anytime"]),
  evening: new Set<TimeOfDay>(["evening", "bedtime", "anytime"]),
};
