import { describe, it, expect } from "vitest";
import {
  bucketTimePeriod,
  computeWeeklySummary,
  type TimerSessionRecord,
} from "../timer-history";

function rec(
  partial: Partial<TimerSessionRecord> & { startedAt: string }
): TimerSessionRecord {
  return {
    plannedDurationSec: 600,
    completed: false,
    ...partial,
  };
}

describe("bucketTimePeriod", () => {
  it("classifies hours into morning/afternoon/evening/night buckets", () => {
    const at = (h: number) => new Date(2026, 4, 11, h, 30);
    expect(bucketTimePeriod(at(7))).toBe("morning");
    expect(bucketTimePeriod(at(11))).toBe("morning");
    expect(bucketTimePeriod(at(12))).toBe("afternoon");
    expect(bucketTimePeriod(at(17))).toBe("afternoon");
    expect(bucketTimePeriod(at(18))).toBe("evening");
    expect(bucketTimePeriod(at(21))).toBe("evening");
    expect(bucketTimePeriod(at(22))).toBe("night");
    expect(bucketTimePeriod(at(2))).toBe("night");
  });
});

describe("computeWeeklySummary", () => {
  const now = new Date("2026-05-11T15:00:00Z");

  it("returns null when fewer than 3 sessions in the past week", () => {
    const records = [
      rec({ startedAt: "2026-05-10T08:00:00Z" }),
      rec({ startedAt: "2026-05-09T08:00:00Z" }),
    ];
    expect(computeWeeklySummary(records, now)).toBeNull();
  });

  it("ignores sessions older than 7 days", () => {
    const records = [
      rec({ startedAt: "2026-05-10T08:00:00Z" }),
      rec({ startedAt: "2026-05-09T08:00:00Z" }),
      rec({ startedAt: "2026-05-08T08:00:00Z" }),
      // > 7 days ago, must be excluded
      rec({ startedAt: "2026-04-01T08:00:00Z" }),
    ];
    const summary = computeWeeklySummary(records, now);
    expect(summary).not.toBeNull();
    expect(summary!.count).toBe(3);
  });

  it("surfaces a peak period only when it leads by ≥ 40%", () => {
    // Flat distribution: 1 morning + 1 afternoon + 1 evening — no peak.
    const flat = [
      rec({ startedAt: "2026-05-10T08:00:00Z" }), // morning
      rec({ startedAt: "2026-05-10T13:00:00Z" }), // afternoon
      rec({ startedAt: "2026-05-10T19:00:00Z" }), // evening
    ];
    expect(computeWeeklySummary(flat, now)?.peakPeriod).toBeNull();

    // Clear morning lead: 4 morning + 1 afternoon = 80% morning
    const morningHeavy = [
      rec({ startedAt: "2026-05-08T07:00:00Z" }),
      rec({ startedAt: "2026-05-09T07:30:00Z" }),
      rec({ startedAt: "2026-05-10T08:00:00Z" }),
      rec({ startedAt: "2026-05-10T08:30:00Z" }),
      rec({ startedAt: "2026-05-10T13:00:00Z" }),
    ];
    expect(computeWeeklySummary(morningHeavy, now)?.peakPeriod).toBe(
      "morning"
    );
  });

  it("surfaces a top sequence only when it appears at least twice", () => {
    const oneOff = [
      rec({ startedAt: "2026-05-10T08:00:00Z", sequenceId: "matin" }),
      rec({ startedAt: "2026-05-10T13:00:00Z" }),
      rec({ startedAt: "2026-05-10T19:00:00Z" }),
    ];
    expect(computeWeeklySummary(oneOff, now)?.topSequenceId).toBeNull();

    const repeated = [
      rec({ startedAt: "2026-05-09T08:00:00Z", sequenceId: "matin" }),
      rec({ startedAt: "2026-05-10T08:00:00Z", sequenceId: "matin" }),
      rec({ startedAt: "2026-05-10T13:00:00Z" }),
    ];
    expect(computeWeeklySummary(repeated, now)?.topSequenceId).toBe("matin");
  });
});
