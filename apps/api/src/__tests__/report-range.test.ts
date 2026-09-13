import { describe, it, expect } from "vitest";
import { resolveDateRange } from "../lib/report/range";
import { PERIOD_DAYS } from "../lib/periods";

// `resolveDateRange` used to be a private function inside the 1000-line
// report route, reachable only through an authenticated HTTP request with a
// database behind it. As a pure function of (input, timezone) it is
// directly testable.

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

describe("resolveDateRange", () => {
  it("defaults to a quarter when no period or bounds are given", () => {
    const range = resolveDateRange({}, "Europe/Paris");
    expect("error" in range).toBe(false);
    if ("error" in range) return;
    expect(daysBetween(range.sinceDate, range.untilDate)).toBe(
      PERIOD_DAYS.quarter,
    );
  });

  it.each(["week", "month", "quarter"] as const)(
    "spans %s exactly",
    (period) => {
      const range = resolveDateRange({ period }, "Europe/Paris");
      if ("error" in range) throw new Error(range.error);
      expect(daysBetween(range.sinceDate, range.untilDate)).toBe(
        PERIOD_DAYS[period],
      );
    },
  );

  it("honours explicit bounds over the period", () => {
    const range = resolveDateRange(
      { period: "week", from: "2026-01-01", to: "2026-02-01" },
      "Europe/Paris",
    );
    expect(range).toEqual({ sinceDate: "2026-01-01", untilDate: "2026-02-01" });
  });

  it("runs `from` to today when `to` is omitted", () => {
    const today = resolveDateRange({}, "Europe/Paris");
    if ("error" in today) throw new Error(today.error);
    const range = resolveDateRange({ from: "2026-01-01" }, "Europe/Paris");
    if ("error" in range) throw new Error(range.error);
    expect(range.untilDate).toBe(today.untilDate);
  });

  it("rejects an inverted range in French", () => {
    const range = resolveDateRange(
      { from: "2026-02-01", to: "2026-01-01" },
      "Europe/Paris",
    );
    expect(range).toEqual({
      error: "La date de début doit précéder la date de fin.",
    });
  });
});
