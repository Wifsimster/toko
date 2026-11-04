import { describe, expect, it } from "vitest";
import { readTrend, type ReadingPoint } from "../src/lib/insight-reading";

function day(offset: number, v: Partial<ReadingPoint> = {}): ReadingPoint {
  const d = new Date(Date.UTC(2026, 10, 4));
  d.setUTCDate(d.getUTCDate() - offset);
  return { date: d.toISOString().slice(0, 10), mood: 5, focus: 5, agitation: 5, impulse: 5, sleep: 5, ...v };
}

const TODAY = "2026-11-04";

describe("lecture des tendances (readTrend)", () => {
  it("needs enough days in both halves", () => {
    expect(readTrend([day(0), day(1), day(20)], TODAY)).toBeNull();
  });

  it("reads lower agitation as better", () => {
    const points = [
      ...[0, 2, 4, 6].map((o) => day(o, { agitation: 3 })),
      ...[15, 17, 19, 21].map((o) => day(o, { agitation: 6 })),
    ];
    expect(readTrend(points, TODAY)).toEqual({ dimension: "agitation", direction: "better" });
  });

  it("reads a drop in mood as harder", () => {
    const points = [
      ...[0, 2, 4, 6].map((o) => day(o, { mood: 3 })),
      ...[15, 17, 19, 21].map((o) => day(o, { mood: 6 })),
    ];
    expect(readTrend(points, TODAY)).toEqual({ dimension: "mood", direction: "harder" });
  });

  it("stays quiet below a one-point change", () => {
    const points = [
      ...[0, 2, 4, 6].map((o) => day(o, { sleep: 5.5 })),
      ...[15, 17, 19, 21].map((o) => day(o, { sleep: 5 })),
    ];
    expect(readTrend(points, TODAY)).toBeNull();
  });

  it("ignores days older than four weeks", () => {
    const points = [
      ...[0, 2, 4, 6].map((o) => day(o)),
      ...[30, 32, 34, 36].map((o) => day(o, { mood: 1 })),
    ];
    expect(readTrend(points, TODAY)).toBeNull();
  });
});

describe("lecture des tendances : bornes", () => {
  it("keeps the strongest change when several dimensions move", () => {
    const points = [
      ...[0, 2, 4, 6].map((o) => day(o, { focus: 7, sleep: 3 })),
      ...[15, 17, 19, 21].map((o) => day(o, { focus: 5.5, sleep: 6 })),
    ];
    expect(readTrend(points, TODAY)).toEqual({ dimension: "sleep", direction: "harder" });
  });

  it("puts day 13 in the recent half and day 14 in the previous one", () => {
    const points = [
      ...[0, 1, 2, 13].map((o) => day(o, { impulse: 8 })),
      ...[14, 20, 25, 27].map((o) => day(o, { impulse: 4 })),
    ];
    expect(readTrend(points, TODAY)).toEqual({ dimension: "impulse", direction: "harder" });
  });

  it("reads an exact one-point change", () => {
    const points = [
      ...[0, 2, 4, 6].map((o) => day(o, { focus: 6 })),
      ...[15, 17, 19, 21].map((o) => day(o, { focus: 5 })),
    ];
    expect(readTrend(points, TODAY)).toEqual({ dimension: "focus", direction: "better" });
  });
});
