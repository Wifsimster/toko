import { describe, it, expect } from "vitest";
import { toLocalISODate, localISODateDaysAgo } from "../lib/local-date";

describe("toLocalISODate", () => {
  it("returns the local calendar day for Europe/Paris just past local midnight", () => {
    const d = new Date("2026-06-03T23:30:00Z");
    expect(toLocalISODate("Europe/Paris", d)).toBe("2026-06-04");
  });

  it("returns the previous day for Europe/Paris right before local midnight", () => {
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
    const d = new Date("2026-06-03T23:30:00Z");
    expect(localISODateDaysAgo("Europe/Paris", 0, d)).toBe("2026-06-04");
    expect(localISODateDaysAgo("Europe/Paris", 7, d)).toBe("2026-05-28");
  });

  it("crosses a DST transition without drifting by an hour", () => {
    const d = new Date("2026-04-01T10:00:00Z");
    expect(localISODateDaysAgo("Europe/Paris", 7, d)).toBe("2026-03-25");
  });
});
