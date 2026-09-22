import { describe, it, expect } from "vitest";
import {
  bestAndHardestDay,
  consistencyScore,
  currentStreak,
  daysSinceLastEntry,
  moodTrend,
  topJournalTags,
  type SymptomPoint,
} from "../lib/stats/metrics";

// These numbers go straight onto the parent's dashboard. They were inline
// in the stats handler and had no coverage.

function point(date: string, over: Partial<SymptomPoint> = {}): SymptomPoint {
  return { date, mood: 5, focus: 5, agitation: 5, impulse: 5, sleep: 5, ...over };
}

describe("currentStreak", () => {
  it("counts back from today without gaps", () => {
    expect(
      currentStreak(["2026-03-13", "2026-03-12", "2026-03-11"], "2026-03-13"),
    ).toBe(3);
  });

  it("stops at the first missing day", () => {
    expect(
      currentStreak(["2026-03-13", "2026-03-11", "2026-03-10"], "2026-03-13"),
    ).toBe(1);
  });

  it("is zero when today has no entry", () => {
    expect(currentStreak(["2026-03-12"], "2026-03-13")).toBe(0);
  });

  it("crosses a month boundary", () => {
    expect(
      currentStreak(["2026-03-01", "2026-02-28", "2026-02-27"], "2026-03-01"),
    ).toBe(3);
  });

  it("never looks further back than the bound", () => {
    const everyDay = Array.from({ length: 40 }, (_, i) => {
      const d = new Date("2026-03-13T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString().slice(0, 10);
    });
    expect(currentStreak(everyDay, "2026-03-13", 30)).toBe(30);
  });
});

describe("daysSinceLastEntry", () => {
  it("counts whole days", () => {
    expect(daysSinceLastEntry("2026-03-10", "2026-03-13")).toBe(3);
  });

  it("is zero when the last entry is today", () => {
    expect(daysSinceLastEntry("2026-03-13", "2026-03-13")).toBe(0);
  });

  it("is null when there has never been an entry", () => {
    expect(daysSinceLastEntry(null, "2026-03-13")).toBeNull();
    expect(daysSinceLastEntry(undefined, "2026-03-13")).toBeNull();
  });
});

describe("moodTrend", () => {
  it("says nothing on too few points — three noisy days are not a trend", () => {
    expect(
      moodTrend([
        point("2026-03-01", { mood: 1 }),
        point("2026-03-02", { mood: 9 }),
        point("2026-03-03", { mood: 2 }),
      ]),
    ).toBeNull();
  });

  it("reads a rise", () => {
    expect(
      moodTrend([
        point("2026-03-01", { mood: 3 }),
        point("2026-03-02", { mood: 3 }),
        point("2026-03-03", { mood: 7 }),
        point("2026-03-04", { mood: 8 }),
      ]),
    ).toBe("up");
  });

  it("reads a fall", () => {
    expect(
      moodTrend([
        point("2026-03-01", { mood: 8 }),
        point("2026-03-02", { mood: 7 }),
        point("2026-03-03", { mood: 3 }),
        point("2026-03-04", { mood: 3 }),
      ]),
    ).toBe("down");
  });

  it("calls a small wobble stable rather than alarming the parent", () => {
    expect(
      moodTrend([
        point("2026-03-01", { mood: 5 }),
        point("2026-03-02", { mood: 5 }),
        point("2026-03-03", { mood: 5 }),
        point("2026-03-04", { mood: 6 }),
      ]),
    ).toBe("stable");
  });
});

describe("consistencyScore", () => {
  it("is null when nothing was logged", () => {
    expect(consistencyScore([], 7)).toBeNull();
  });

  it("is 100 for a full week of good days", () => {
    const week = Array.from({ length: 7 }, (_, i) =>
      point(`2026-03-0${i + 1}`, { mood: 8, focus: 8 }),
    );
    expect(consistencyScore(week, 7)).toBe(100);
  });

  it("never exceeds 100 when the query window spans an extra day", () => {
    const eightDays = Array.from({ length: 8 }, (_, i) =>
      point(`2026-03-0${i + 1}`, { mood: 8, focus: 8 }),
    );
    expect(consistencyScore(eightDays, 7)).toBe(100);
  });

  it("halves when only half the days were logged", () => {
    const half = Array.from({ length: 4 }, (_, i) =>
      point(`2026-03-0${i + 1}`, { mood: 8, focus: 8 }),
    );
    expect(consistencyScore(half, 8)).toBe(50);
  });

  it("counts a hard day as logged but not ok", () => {
    expect(
      consistencyScore(
        [
          point("2026-03-01", { mood: 8, focus: 8 }),
          point("2026-03-02", { mood: 2, focus: 2, agitation: 9, impulse: 9 }),
        ],
        2,
      ),
    ).toBe(50);
  });
});

describe("topJournalTags", () => {
  it("ranks by frequency", () => {
    expect(
      topJournalTags([
        { tags: ["school", "crisis"] },
        { tags: ["school"] },
        { tags: ["sleep", "school"] },
        { tags: ["crisis"] },
      ]),
    ).toEqual(["school", "crisis", "sleep"]);
  });

  it("ignores entries with no tags", () => {
    expect(topJournalTags([{ tags: null }, { tags: ["school"] }])).toEqual([
      "school",
    ]);
  });

  it("caps the list", () => {
    expect(
      topJournalTags([{ tags: ["a", "b", "c", "d"] }], 2),
    ).toHaveLength(2);
  });
});

describe("bestAndHardestDay", () => {
  it("picks the extremes by composite score", () => {
    expect(
      bestAndHardestDay([
        point("2026-03-01", { mood: 9, focus: 9, agitation: 1, impulse: 1 }),
        point("2026-03-02"),
        point("2026-03-03", { mood: 1, focus: 1, agitation: 9, impulse: 9 }),
      ]),
    ).toEqual({ bestDay: "2026-03-01", hardestDay: "2026-03-03" });
  });

  it("averages several entries on the same day", () => {
    const { bestDay } = bestAndHardestDay([
      point("2026-03-01", { mood: 10, focus: 10 }),
      point("2026-03-01", { mood: 0, focus: 0 }),
      point("2026-03-02", { mood: 7, focus: 7 }),
    ]);
    expect(bestDay).toBe("2026-03-02");
  });

  it("does not name the same day twice", () => {
    expect(bestAndHardestDay([point("2026-03-01")])).toEqual({
      bestDay: "2026-03-01",
      hardestDay: null,
    });
  });

  it("is empty when nothing was logged", () => {
    expect(bestAndHardestDay([])).toEqual({ bestDay: null, hardestDay: null });
  });
});
