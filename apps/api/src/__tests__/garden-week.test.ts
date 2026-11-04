import { describe, expect, it } from "vitest";
import { gardenWeekDates } from "../lib/garden-week";

describe("gardenWeekDates", () => {
  it("starts the week on Monday", () => {
    expect(gardenWeekDates("2026-11-04")).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
  });

  it("keeps Sunday in the week that started the Monday before", () => {
    expect(gardenWeekDates("2026-11-08")[0]).toBe("2026-11-02");
    expect(gardenWeekDates("2026-11-09")[0]).toBe("2026-11-09");
  });

  it("crosses month and year boundaries", () => {
    expect(gardenWeekDates("2027-01-01")).toEqual([
      "2026-12-28",
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
    ]);
  });
});
