import { describe, it, expect } from "vitest";
import {
  calmMinutesForDay,
  aggregateDailyCalmMinutes,
  CALM_MINUTES_DAILY_CAP,
} from "../lib/calm-minutes";

describe("calmMinutesForDay", () => {
  it("returns 0 on a hard day", () => {
    expect(
      calmMinutesForDay({
        routinesOk: false,
        agitation: 9,
        mood: 2,
        focus: 2,
        impulse: 9,
      })
    ).toBe(0);
  });

  it("caps at 40 minutes", () => {
    const best = calmMinutesForDay({
      routinesOk: true,
      agitation: 0,
      mood: 10,
      focus: 10,
      impulse: 0,
    });
    expect(best).toBe(CALM_MINUTES_DAILY_CAP);
  });

  it("awards routinesOk alone", () => {
    expect(
      calmMinutesForDay({
        routinesOk: true,
        agitation: 7,
        mood: 5,
        focus: 5,
        impulse: 7,
      })
    ).toBe(15);
  });

  it("awards low agitation alone", () => {
    expect(
      calmMinutesForDay({
        routinesOk: false,
        agitation: 3,
        mood: 5,
        focus: 5,
        impulse: 7,
      })
    ).toBe(10);
  });
});

describe("aggregateDailyCalmMinutes", () => {
  it("keeps only the max score per day", () => {
    const out = aggregateDailyCalmMinutes([
      { date: "2026-04-20", routinesOk: false, agitation: 9, mood: 5, focus: 5, impulse: 7 },
      { date: "2026-04-20", routinesOk: true,  agitation: 3, mood: 7, focus: 7, impulse: 3 },
    ]);
    expect(out).toEqual([{ date: "2026-04-20", minutes: 40 }]);
  });

  it("sorts dates ascending", () => {
    const out = aggregateDailyCalmMinutes([
      { date: "2026-04-22", routinesOk: true, agitation: 5, mood: 5, focus: 5, impulse: 5 },
      { date: "2026-04-20", routinesOk: true, agitation: 5, mood: 5, focus: 5, impulse: 5 },
    ]);
    expect(out.map((d) => d.date)).toEqual(["2026-04-20", "2026-04-22"]);
  });
});
