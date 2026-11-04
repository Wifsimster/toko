import { describe, expect, it } from "vitest";
import type { Symptom } from "@focusflow/validators";
import { mondayWeekOf, symptomWeek } from "../symptom-week";

function entry(date: string, v: Partial<Symptom>): Symptom {
  return {
    id: date,
    childId: "c",
    date,
    agitation: 5,
    focus: 5,
    impulse: 5,
    mood: 5,
    sleep: 5,
    routinesOk: true,
    ...v,
  } as Symptom;
}

describe("mondayWeekOf", () => {
  it("returns Monday to Sunday around the given day", () => {
    expect(mondayWeekOf("2026-11-04")).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
    expect(mondayWeekOf("2026-11-08")[0]).toBe("2026-11-02");
    expect(mondayWeekOf("2027-01-01")[0]).toBe("2026-12-28");
  });
});

describe("symptomWeek", () => {
  it("colours logged days by level and leaves the others empty", () => {
    const week = symptomWeek(
      [
        entry("2026-11-02", { agitation: 3, focus: 7, impulse: 3, mood: 8, sleep: 7 }),
        entry("2026-11-03", { agitation: 8, focus: 3, impulse: 8, mood: 3, sleep: 4 }),
        entry("2026-11-04", {}),
        entry("2026-10-30", {}),
      ],
      "2026-11-04",
    );
    expect(week.map((d) => d.level)).toEqual(["good", "hard", "ok", null, null, null, null]);
  });
});
