import type { TimeOfDay } from "@focusflow/validators";

export type CompanionSlot = "morning" | "evening";

export const SLOT_TIME_OF_DAY: Record<CompanionSlot, ReadonlySet<TimeOfDay>> = {
  morning: new Set<TimeOfDay>(["morning", "noon", "anytime"]),
  evening: new Set<TimeOfDay>(["evening", "bedtime", "anytime"]),
};
