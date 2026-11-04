import { describe, expect, it } from "vitest";
import {
  SYMPTOM_NEUTRAL,
  SYMPTOM_PRESET_CALM,
  SYMPTOM_PRESET_TOUGH,
  type Symptom,
} from "@focusflow/validators";
import { latestSymptom, symptomOn, valuesForChoice, weekPills } from "../src/lib/day-log";

function entry(date: string, values: Partial<Symptom> = {}, updatedAt = `${date}T20:00:00.000Z`): Symptom {
  return {
    id: `${date}-${updatedAt}`,
    childId: "00000000-0000-4000-8000-000000000000",
    date,
    agitation: 5,
    focus: 5,
    impulse: 5,
    mood: 5,
    sleep: 5,
    routinesOk: true,
    createdAt: updatedAt,
    updatedAt,
    ...values,
  };
}

const WEDNESDAY = new Date(2026, 10, 4, 9, 0);

describe("semaine de la journée", () => {
  it("va du lundi au dimanche de la semaine en cours", () => {
    const pills = weekPills([], WEDNESDAY);
    expect(pills.map((p) => p.iso)).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
    expect(pills.map((p) => p.initial).join("")).toBe("LMMJVSD");
    expect(pills.findIndex((p) => p.isToday)).toBe(2);
  });

  it("le dimanche reste le dernier jour de sa semaine", () => {
    const pills = weekPills([], new Date(2026, 10, 8, 12, 0));
    expect(pills[0]?.iso).toBe("2026-11-02");
    expect(pills[6]?.isToday).toBe(true);
  });

  it("colore chaque jour par son niveau et nomme les jours sans relevé", () => {
    const pills = weekPills(
      [
        entry("2026-11-02", SYMPTOM_PRESET_CALM),
        entry("2026-11-03", SYMPTOM_PRESET_TOUGH),
        entry("2026-11-04"),
        entry("2026-10-28", SYMPTOM_PRESET_CALM),
      ],
      WEDNESDAY,
    );
    expect(pills.map((p) => p.level)).toEqual(["good", "hard", "ok", null, null, null, null]);
    expect(pills[0]?.accessibilityLabel).toBe("Lundi : journée calme");
    expect(pills[1]?.accessibilityLabel).toBe("Mardi : journée difficile");
    expect(pills[2]?.accessibilityLabel).toBe("Mercredi : journée typique");
    expect(pills[3]?.accessibilityLabel).toBe("Jeudi : à venir");
    expect(pills[3]?.isFuture).toBe(true);
  });

  it("un jour passé sans relevé est dit sans relevé", () => {
    const pills = weekPills([entry("2026-11-04")], WEDNESDAY);
    expect(pills[1]?.accessibilityLabel).toBe("Mardi : pas de relevé");
    expect(pills[1]?.isFuture).toBe(false);
  });

  it("garde le dernier relevé quand un jour en a deux", () => {
    const pills = weekPills(
      [
        entry("2026-11-04", SYMPTOM_PRESET_TOUGH, "2026-11-04T08:00:00.000Z"),
        entry("2026-11-04", SYMPTOM_PRESET_CALM, "2026-11-04T19:00:00.000Z"),
      ],
      WEDNESDAY,
    );
    expect(pills[2]?.level).toBe("good");
  });
});

describe("tuiles de la journée", () => {
  it("calme et difficile prennent les valeurs partagées avec le web", () => {
    expect(valuesForChoice("calm", [])).toEqual(SYMPTOM_PRESET_CALM);
    expect(valuesForChoice("tough", [entry("2026-11-03")])).toEqual(SYMPTOM_PRESET_TOUGH);
  });

  it("typique reprend le dernier relevé, sans ses champs d'identité", () => {
    const values = valuesForChoice("typical", [
      entry("2026-11-01", { mood: 2 }),
      entry("2026-11-03", { mood: 6, sleep: 4, routinesOk: false }),
    ]);
    expect(values).toEqual({ agitation: 5, focus: 5, impulse: 5, mood: 6, sleep: 4, routinesOk: false });
  });

  it("typique sans historique retombe sur les valeurs neutres", () => {
    expect(valuesForChoice("typical", [])).toEqual(SYMPTOM_NEUTRAL);
    expect(valuesForChoice("typical", undefined)).toEqual(SYMPTOM_NEUTRAL);
  });

  it("retrouve le relevé du jour", () => {
    const today = entry("2026-11-04", { mood: 9 });
    expect(symptomOn([entry("2026-11-03"), today], "2026-11-04")).toBe(today);
    expect(symptomOn([entry("2026-11-03")], "2026-11-04")).toBeNull();
    expect(latestSymptom([])).toBeNull();
  });
});
