import { describe, expect, it } from "vitest";
import {
  currentRoutine,
  mondayBasedDay,
  pickHomeFocus,
  todaysRoutines,
  upcomingRoutine,
  type HomeRoutine,
} from "../home-focus";
import type { Routine, TimeOfDay } from "../routine";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function routine(
  n: number,
  timeOfDay: TimeOfDay,
  opts: { steps?: number; days?: number[]; active?: boolean; position?: number } = {},
): Routine {
  const steps = opts.steps ?? 3;
  return {
    id: id(n),
    childId: id(999),
    name: `Routine ${n}`,
    emoji: null,
    timeOfDay,
    daysOfWeek: opts.days ?? [],
    position: opts.position ?? n,
    active: opts.active ?? true,
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
    steps: Array.from({ length: steps }, (_, i) => ({
      id: id(n * 100 + i),
      routineId: id(n),
      label: `Étape ${i + 1}`,
      emoji: null,
      durationMinutes: null,
      position: i,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    })),
  };
}

const home = (
  n: number,
  timeOfDay: TimeOfDay,
  doneCount = 0,
  stepCount = 3,
): HomeRoutine => ({ id: id(n), name: `Routine ${n}`, emoji: null, timeOfDay, stepCount, doneCount });

const monday = new Date(2026, 9, 26, 12);

describe("mondayBasedDay", () => {
  it("compte lundi = 0 et dimanche = 6, comme les routines", () => {
    expect(mondayBasedDay(monday)).toBe(0);
    expect(mondayBasedDay(new Date(2026, 10, 1, 12))).toBe(6);
  });
});

describe("todaysRoutines", () => {
  it("garde les routines actives du jour avec au moins une étape, dans l'ordre de la journée", () => {
    const list = todaysRoutines(
      [
        routine(1, "evening"),
        routine(2, "morning"),
        routine(3, "morning", { active: false }),
        routine(4, "morning", { days: [5, 6] }),
        routine(5, "noon", { steps: 0 }),
        routine(6, "bedtime", { days: [0] }),
      ],
      new Set([id(100), id(101)]),
      monday,
    );
    expect(list.map((r) => r.id)).toEqual([id(2), id(1), id(6)]);
    expect(list.find((r) => r.id === id(1))).toMatchObject({ stepCount: 3, doneCount: 2 });
  });
});

describe("currentRoutine / upcomingRoutine", () => {
  const list = [home(1, "morning"), home(2, "evening")];

  it("propose la routine du matin le matin, pas celle du soir", () => {
    expect(currentRoutine(list, 8)?.id).toBe(id(1));
    expect(currentRoutine([home(2, "evening")], 8)).toBeNull();
  });

  it("ne rappelle plus une routine du matin passée", () => {
    expect(currentRoutine(list, 15)).toBeNull();
    expect(upcomingRoutine(list, 15)?.id).toBe(id(2));
  });

  it("saute une routine finie et celle que la carte montre déjà", () => {
    expect(currentRoutine([home(1, "morning", 3), home(3, "anytime")], 8)?.id).toBe(id(3));
    expect(upcomingRoutine(list, 8, id(1))?.id).toBe(id(2));
    expect(upcomingRoutine([home(2, "evening")], 23)).toBeNull();
  });
});

describe("pickHomeFocus", () => {
  const base = { hour: 10, daysSinceLastEntry: 0, eveningDone: false, routines: [] };

  it("1. deux jours ou plus sans relevé : noter la journée, même le soir", () => {
    expect(pickHomeFocus({ ...base, daysSinceLastEntry: 3, hour: 19 })).toEqual({
      kind: "catch-up",
      days: 3,
    });
    expect(pickHomeFocus({ ...base, daysSinceLastEntry: 1 }).kind).not.toBe("catch-up");
    expect(pickHomeFocus({ ...base, daysSinceLastEntry: null }).kind).not.toBe("catch-up");
  });

  it("2. à partir de 17 h, soirée pas notée : le point du soir avant la routine", () => {
    const routines = [home(2, "evening")];
    expect(pickHomeFocus({ ...base, hour: 17, routines })).toEqual({ kind: "evening" });
    expect(pickHomeFocus({ ...base, hour: 16, routines })).toMatchObject({ kind: "routine" });
  });

  it("3. la routine du moment pas encore finie", () => {
    const focus = pickHomeFocus({ ...base, hour: 8, routines: [home(1, "morning", 1)] });
    expect(focus).toEqual({ kind: "routine", routine: home(1, "morning", 1) });
    expect(
      pickHomeFocus({ ...base, hour: 19, eveningDone: true, routines: [home(2, "evening")] }).kind,
    ).toBe("routine");
  });

  it("4. plus rien à faire : tout est noté si la soirée l'est, sinon rien ne presse", () => {
    expect(pickHomeFocus({ ...base, hour: 21, eveningDone: true })).toEqual({ kind: "all-done" });
    expect(pickHomeFocus({ ...base, hour: 10 })).toEqual({ kind: "nothing-pressing" });
    expect(
      pickHomeFocus({ ...base, hour: 10, routines: [home(1, "morning", 3)] }).kind,
    ).toBe("nothing-pressing");
  });
});
