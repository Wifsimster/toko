import { describe, expect, it } from "vitest";
import type { Routine } from "@focusflow/validators";
import { pickRoutineNow, routineMinutes, slotAt } from "../routine-now";

function routine(id: string, timeOfDay: Routine["timeOfDay"], steps: { id: string; durationMinutes?: number }[]): Routine {
  return {
    id,
    timeOfDay,
    name: id,
    steps: steps.map((s) => ({ label: s.id, emoji: null, ...s })),
  } as unknown as Routine;
}

describe("slotAt", () => {
  it("maps the hour to a time slot", () => {
    expect(slotAt(7)).toBe("morning");
    expect(slotAt(12)).toBe("noon");
    expect(slotAt(16)).toBe("evening");
    expect(slotAt(20)).toBe("bedtime");
  });
});

describe("pickRoutineNow", () => {
  const morning = routine("matin", "morning", [{ id: "a" }, { id: "b" }]);
  const school = routine("retour", "evening", [{ id: "c", durationMinutes: 10 }, { id: "d", durationMinutes: 30 }]);
  const anytime = routine("libre", "anytime", [{ id: "e" }]);

  it("picks the open routine of the current slot", () => {
    expect(pickRoutineNow([morning, school], new Set(), 16)?.id).toBe("retour");
  });

  it("skips a routine whose steps are all done", () => {
    expect(pickRoutineNow([school, anytime], new Set(["c", "d"]), 16)?.id).toBe("libre");
  });

  it("returns null when nothing fits", () => {
    expect(pickRoutineNow([morning], new Set(), 20)).toBeNull();
  });

  it("sums step durations", () => {
    expect(routineMinutes(school)).toBe(40);
    expect(routineMinutes(morning)).toBe(0);
  });
});
