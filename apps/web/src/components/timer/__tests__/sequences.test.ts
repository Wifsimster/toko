import { describe, expect, it } from "vitest";
import type { Routine } from "@focusflow/validators";
import { routineToSequence } from "../sequences";

function makeStep(
  overrides: Partial<Routine["steps"][number]> & { id: string },
): Routine["steps"][number] {
  return {
    routineId: "routine-1",
    label: `Step ${overrides.id}`,
    emoji: null,
    durationMinutes: 5,
    position: 0,
    createdAt: "2026-06-03T00:00:00Z",
    updatedAt: "2026-06-03T00:00:00Z",
    ...overrides,
  };
}

function makeRoutine(steps: Routine["steps"]): Routine {
  return {
    id: "routine-1",
    childId: "child-1",
    name: "Routine du soir",
    emoji: "🌙",
    timeOfDay: "bedtime",
    daysOfWeek: [],
    position: 0,
    active: true,
    createdAt: "2026-06-03T00:00:00Z",
    updatedAt: "2026-06-03T00:00:00Z",
    steps,
  };
}

describe("routineToSequence", () => {
  it("orders steps by position and skips undurated ones", () => {
    const r = makeRoutine([
      makeStep({ id: "11111111-1111-1111-1111-111111111111", position: 2, durationMinutes: 3 }),
      makeStep({ id: "22222222-2222-2222-2222-222222222222", position: 0, durationMinutes: 5 }),
      makeStep({ id: "33333333-3333-3333-3333-333333333333", position: 1, durationMinutes: null }),
    ]);
    const seq = routineToSequence(r);
    expect(seq).not.toBeNull();
    expect(seq!.routineId).toBe("routine-1");
    expect(seq!.steps).toHaveLength(2);
    expect(seq!.steps[0]?.routineStepId).toBe("22222222-2222-2222-2222-222222222222");
    expect(seq!.steps[0]?.durationSec).toBe(5 * 60);
    expect(seq!.steps[1]?.routineStepId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("filters out already-completed steps when the set is provided", () => {
    const r = makeRoutine([
      makeStep({ id: "11111111-1111-1111-1111-111111111111", position: 0, durationMinutes: 5 }),
      makeStep({ id: "22222222-2222-2222-2222-222222222222", position: 1, durationMinutes: 5 }),
    ]);
    const seq = routineToSequence(
      r,
      new Set(["11111111-1111-1111-1111-111111111111"]),
    );
    expect(seq).not.toBeNull();
    expect(seq!.steps).toHaveLength(1);
    expect(seq!.steps[0]?.routineStepId).toBe(
      "22222222-2222-2222-2222-222222222222",
    );
  });

  it("returns null when every timed step is already completed", () => {
    const r = makeRoutine([
      makeStep({ id: "11111111-1111-1111-1111-111111111111", durationMinutes: 5 }),
      makeStep({ id: "22222222-2222-2222-2222-222222222222", durationMinutes: 5 }),
    ]);
    const seq = routineToSequence(
      r,
      new Set([
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222",
      ]),
    );
    expect(seq).toBeNull();
  });

  it("returns null when the routine has no timed steps", () => {
    const r = makeRoutine([
      makeStep({ id: "11111111-1111-1111-1111-111111111111", durationMinutes: null }),
    ]);
    expect(routineToSequence(r)).toBeNull();
  });
});
