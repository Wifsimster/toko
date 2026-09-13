import { describe, it, expect } from "vitest";
import {
  emptyResult,
  hoursSince,
  localHourIn,
  localTimeIn,
  localWeekdayIn,
} from "../jobs/email/shared";

// "Is it the right local moment for this parent?" is what decides whether a
// reminder goes out at all. These helpers were private to a 636-line
// email-jobs file and had no coverage; a timezone regression here sends
// mail at 3am or not at all.

// 2026-03-13T08:30:00Z — a Friday.
const instant = new Date("2026-03-13T08:30:00Z");

describe("localHourIn", () => {
  it("reads the hour in the target timezone", () => {
    expect(localHourIn("UTC", instant)).toBe(8);
    expect(localHourIn("Europe/Paris", instant)).toBe(9); // CET, +1
    expect(localHourIn("Pacific/Auckland", instant)).toBe(21);
  });

  it("falls back to UTC on an unknown timezone", () => {
    expect(localHourIn("Mars/Olympus", instant)).toBe(8);
  });
});

describe("localTimeIn", () => {
  it("renders zero-padded HH:mm", () => {
    expect(localTimeIn("UTC", instant)).toBe("08:30");
    expect(localTimeIn("Europe/Paris", instant)).toBe("09:30");
  });

  it("falls back to UTC on an unknown timezone", () => {
    expect(localTimeIn("Mars/Olympus", instant)).toBe("08:30");
  });
});

describe("localWeekdayIn", () => {
  it("numbers the week from Sunday = 0", () => {
    expect(localWeekdayIn("Europe/Paris", instant)).toBe(5); // Friday
  });

  it("can land on a different day than UTC", () => {
    // 23:30 UTC Friday is already Saturday in Auckland.
    const late = new Date("2026-03-13T23:30:00Z");
    expect(localWeekdayIn("UTC", late)).toBe(5);
    expect(localWeekdayIn("Pacific/Auckland", late)).toBe(6);
  });
});

describe("hoursSince", () => {
  it("measures elapsed hours", () => {
    expect(hoursSince(new Date("2026-03-13T06:30:00Z"), instant)).toBe(2);
  });

  it("treats 'never' as infinitely long ago, so a first reminder is due", () => {
    expect(hoursSince(null, instant)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("emptyResult", () => {
  it("starts every counter at zero", () => {
    expect(emptyResult()).toEqual({
      processed: 0,
      sent: 0,
      skipped: 0,
      errors: 0,
    });
  });

  it("returns a fresh object each call so jobs cannot share a tally", () => {
    const a = emptyResult();
    a.sent += 1;
    expect(emptyResult().sent).toBe(0);
  });
});
