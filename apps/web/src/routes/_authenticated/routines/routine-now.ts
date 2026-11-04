import type { Routine, TimeOfDay } from "@focusflow/validators";

export function slotAt(hour: number): Exclude<TimeOfDay, "anytime"> {
  if (hour < 11) return "morning";
  if (hour < 14) return "noon";
  if (hour < 19) return "evening";
  return "bedtime";
}

export function pickRoutineNow(
  routines: readonly Routine[],
  completedStepIds: ReadonlySet<string>,
  hour: number,
): Routine | null {
  const slot = slotAt(hour);
  const open = routines.filter(
    (r) => r.steps.length > 0 && r.steps.some((s) => !completedStepIds.has(s.id)),
  );
  return open.find((r) => r.timeOfDay === slot) ?? open.find((r) => r.timeOfDay === "anytime") ?? null;
}

export function routineMinutes(routine: Routine): number {
  return routine.steps.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
}

export const SLOT_SURFACE: Readonly<Record<TimeOfDay, string>> = {
  morning: "bg-surface-honey",
  noon: "bg-surface-mint",
  evening: "bg-surface-sky",
  bedtime: "bg-surface-sky",
  anytime: "bg-surface-mint",
};
