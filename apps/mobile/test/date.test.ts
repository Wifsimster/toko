import { describe, expect, it } from "vitest";
import { formatFrEntryDate } from "../src/lib/date";

describe("date d'une entrée", () => {
  const now = new Date(2026, 10, 1, 13, 0);

  it("aujourd'hui et hier en mots", () => {
    expect(formatFrEntryDate("2026-11-01", now)).toBe("Aujourd'hui");
    expect(formatFrEntryDate("2026-10-31", now)).toBe("Hier");
  });

  it("mois en minuscules, sans année pour l'année en cours", () => {
    expect(formatFrEntryDate("2026-04-05", now)).toBe("5 avril");
  });

  it("année ajoutée pour une autre année", () => {
    expect(formatFrEntryDate("2025-12-24", now)).toBe("24 décembre 2025");
  });
});
