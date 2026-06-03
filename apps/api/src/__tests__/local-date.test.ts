import { describe, it, expect } from "vitest";
import { toLocalISODate, localISODateDaysAgo } from "../lib/local-date";

describe("toLocalISODate", () => {
  it("returns the local calendar day for Europe/Paris just past local midnight", () => {
    // 2026-06-03T23:30:00Z is 2026-06-04 01:30 in Europe/Paris (UTC+2 summer).
    const d = new Date("2026-06-03T23:30:00Z");
    expect(toLocalISODate("Europe/Paris", d)).toBe("2026-06-04");
  });

  it("returns the previous day for Europe/Paris right before local midnight", () => {
    // 2026-06-03T21:00:00Z is 2026-06-03 23:00 in Europe/Paris.
    const d = new Date("2026-06-03T21:00:00Z");
    expect(toLocalISODate("Europe/Paris", d)).toBe("2026-06-03");
  });

  it("uses UTC when timezone is UTC", () => {
    const d = new Date("2026-06-03T23:30:00Z");
    expect(toLocalISODate("UTC", d)).toBe("2026-06-03");
  });

  it("falls back to UTC slice for an invalid timezone", () => {
    const d = new Date("2026-06-03T23:30:00Z");
    expect(toLocalISODate("Mars/Olympus", d)).toBe("2026-06-03");
  });
});

describe("localISODateDaysAgo", () => {
  it("subtracts whole calendar days in the local timezone", () => {
    // Local "today" in Paris is 2026-06-04 at this instant.
    const d = new Date("2026-06-03T23:30:00Z");
    expect(localISODateDaysAgo("Europe/Paris", 0, d)).toBe("2026-06-04");
    expect(localISODateDaysAgo("Europe/Paris", 7, d)).toBe("2026-05-28");
  });

  it("crosses a DST transition without drifting by an hour", () => {
    // 2026-03-29 is the spring-forward day in Europe/Paris (02:00 → 03:00).
    // Anchor at 2026-04-01 10:00Z (12:00 Paris, after DST) and step back 7
    // days — the result must still be 2026-03-25 (a clean calendar week),
    // not 2026-03-24 or anything DST-shifted.
    const d = new Date("2026-04-01T10:00:00Z");
    expect(localISODateDaysAgo("Europe/Paris", 7, d)).toBe("2026-03-25");
  });
});
