import type { Routine, TimeOfDay } from "./routine";

export type HomeRoutine = {
  id: string;
  name: string;
  emoji: string | null;
  timeOfDay: TimeOfDay;
  stepCount: number;
  doneCount: number;
};

export type HomeFocus =
  | { kind: "catch-up"; days: number }
  | { kind: "evening" }
  | { kind: "routine"; routine: HomeRoutine }
  | { kind: "all-done" }
  | { kind: "nothing-pressing" };

export const EVENING_HOUR = 17;

export const CATCH_UP_DAYS = 2;

const SLOTS: Record<TimeOfDay, { order: number; start: number; end: number }> = {
  morning: { order: 0, start: 0, end: 12 },
  noon: { order: 1, start: 11, end: 15 },
  anytime: { order: 2, start: 0, end: 24 },
  evening: { order: 3, start: 16, end: 22 },
  bedtime: { order: 4, start: 18, end: 24 },
};

export function mondayBasedDay(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function todaysRoutines(
  routines: readonly Routine[],
  completedStepIds: ReadonlySet<string>,
  date: Date,
): HomeRoutine[] {
  const day = mondayBasedDay(date);
  return routines
    .filter(
      (r) =>
        r.active &&
        r.steps.length > 0 &&
        (r.daysOfWeek.length === 0 || r.daysOfWeek.includes(day)),
    )
    .sort(
      (a, b) =>
        SLOTS[a.timeOfDay].order - SLOTS[b.timeOfDay].order ||
        a.position - b.position,
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      timeOfDay: r.timeOfDay,
      stepCount: r.steps.length,
      doneCount: r.steps.filter((s) => completedStepIds.has(s.id)).length,
    }));
}

function unfinished(r: HomeRoutine): boolean {
  return r.doneCount < r.stepCount;
}

export function currentRoutine(
  routines: readonly HomeRoutine[],
  hour: number,
): HomeRoutine | null {
  return (
    routines.find(
      (r) =>
        unfinished(r) &&
        hour >= SLOTS[r.timeOfDay].start &&
        hour < SLOTS[r.timeOfDay].end,
    ) ?? null
  );
}

export function upcomingRoutine(
  routines: readonly HomeRoutine[],
  hour: number,
  exceptId?: string,
): HomeRoutine | null {
  return (
    routines.find(
      (r) => r.id !== exceptId && unfinished(r) && hour < SLOTS[r.timeOfDay].end,
    ) ?? null
  );
}

export function pickHomeFocus(input: {
  hour: number;
  daysSinceLastEntry: number | null;
  eveningDone: boolean;
  routines: readonly HomeRoutine[];
}): HomeFocus {
  const { hour, daysSinceLastEntry, eveningDone, routines } = input;
  if (!eveningDone && daysSinceLastEntry != null && daysSinceLastEntry >= CATCH_UP_DAYS) {
    return { kind: "catch-up", days: daysSinceLastEntry };
  }
  if (!eveningDone && hour >= EVENING_HOUR) return { kind: "evening" };
  const routine = currentRoutine(routines, hour);
  if (routine) return { kind: "routine", routine };
  return eveningDone ? { kind: "all-done" } : { kind: "nothing-pressing" };
}
