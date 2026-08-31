import { describe, it, expect } from "vitest";
import {
  formatLongDate,
  formatLongDateTitle,
  parseISODate,
  toISODate,
  todayISO,
} from "../date";

describe("parseISODate", () => {
  it("reads a stored day as a local calendar day", () => {
    const d = parseISODate("2026-08-31");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(31);
  });

  it("round-trips with toISODate", () => {
    expect(toISODate(parseISODate("2026-01-01"))).toBe("2026-01-01");
    expect(toISODate(parseISODate(todayISO()))).toBe(todayISO());
  });
});

describe("formatLongDate", () => {
  it("stays lower case for use inside a sentence", () => {
    expect(formatLongDate("2026-08-31", "fr-FR")).toBe("lundi 31 août 2026");
  });

  it("accepts custom Intl options", () => {
    expect(
      formatLongDate("2026-08-31", "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    ).toBe("lundi 31 août");
  });
});

describe("formatLongDateTitle", () => {
  it("capitalises only the first letter in French", () => {
    expect(formatLongDateTitle("2026-08-31", "fr-FR")).toBe("Lundi 31 août 2026");
  });

  it("formats English dates too", () => {
    expect(formatLongDateTitle("2026-08-31", "en-US")).toBe(
      "Monday, August 31, 2026"
    );
  });
});
