import { describe, expect, it } from "vitest";
import type { Routine } from "@focusflow/validators";
import { SLOT_SURFACE, pickRoutineNow, routineMinutes, slotAt } from "../src/lib/routine-now";

function routine(id: string, timeOfDay: Routine["timeOfDay"], steps: { id: string; durationMinutes?: number }[]): Routine {
  return {
    id,
    timeOfDay,
    name: id,
    steps: steps.map((s, i) => ({ label: s.id, emoji: null, position: i, ...s })),
  } as unknown as Routine;
}

describe("slotAt", () => {
  it("maps the hour to a time slot", () => {
    expect(slotAt(0)).toBe("morning");
    expect(slotAt(10)).toBe("morning");
    expect(slotAt(11)).toBe("noon");
    expect(slotAt(13)).toBe("noon");
    expect(slotAt(14)).toBe("evening");
    expect(slotAt(18)).toBe("evening");
    expect(slotAt(19)).toBe("bedtime");
  });
});

describe("pickRoutineNow", () => {
  const morning = routine("matin", "morning", [{ id: "a" }, { id: "b" }]);
  const school = routine("retour", "evening", [{ id: "c", durationMinutes: 10 }, { id: "d", durationMinutes: 30 }]);
  const anytime = routine("libre", "anytime", [{ id: "e" }]);
  const empty = routine("vide", "evening", []);

  it("picks the open routine of the current slot", () => {
    expect(pickRoutineNow([morning, school], new Set(), 16)?.id).toBe("retour");
  });

  it("prefers the slot over an anytime routine", () => {
    expect(pickRoutineNow([anytime, school], new Set(), 16)?.id).toBe("retour");
  });

  it("skips a routine whose steps are all done or that has no step", () => {
    expect(pickRoutineNow([empty, school, anytime], new Set(["c", "d"]), 16)?.id).toBe("libre");
  });

  it("returns null when nothing fits", () => {
    expect(pickRoutineNow([morning], new Set(), 20)).toBeNull();
  });

  it("sums step durations", () => {
    expect(routineMinutes(school)).toBe(40);
    expect(routineMinutes(morning)).toBe(0);
  });

  it("gives each moment its pastel", () => {
    expect(SLOT_SURFACE.morning).toBe("surfaceHoney");
    expect(SLOT_SURFACE.noon).toBe("surfaceMint");
    expect(SLOT_SURFACE.evening).toBe("surfaceSky");
    expect(SLOT_SURFACE.bedtime).toBe("surfaceSky");
    expect(SLOT_SURFACE.anytime).toBe("surfaceMint");
  });
});
