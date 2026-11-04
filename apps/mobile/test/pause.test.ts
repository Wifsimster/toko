import { describe, expect, it } from "vitest";
import { gardenSchema } from "@focusflow/validators";
import {
  clockElapsed,
  formatCountdown,
  gardenWeek,
  pauseMinutesWords,
  remainingMs,
  resumeClock,
  startClock,
  stopClock,
  withTodayLeaf,
} from "../src/lib/pause";
import { pause as copy } from "../src/lib/copy";

const week = (leaves: boolean[]) =>
  leaves.map((leaf, i) => ({ date: `2026-11-0${i + 2}`, leaf }));

describe("compte à rebours de la pause", () => {
  it("affiche m:ss en arrondissant à la seconde supérieure", () => {
    expect(formatCountdown(remainingMs(2, 0))).toBe("2:00");
    expect(formatCountdown(remainingMs(2, 1))).toBe("2:00");
    expect(formatCountdown(remainingMs(1, 1000))).toBe("0:59");
    expect(formatCountdown(remainingMs(5, 0))).toBe("5:00");
    expect(formatCountdown(remainingMs(1, 90_000))).toBe("0:00");
  });

  it("ne compte pas le temps en pause", () => {
    let clock = startClock(1000);
    expect(clockElapsed(clock, 11_000)).toBe(10_000);
    clock = stopClock(clock, 11_000);
    expect(clockElapsed(clock, 60_000)).toBe(10_000);
    clock = resumeClock(clock, 60_000);
    expect(clockElapsed(clock, 65_000)).toBe(15_000);
  });

  it("ignore un double arrêt ou une double reprise", () => {
    const running = startClock(0);
    expect(resumeClock(running, 500)).toBe(running);
    const stopped = stopClock(running, 1000);
    expect(stopClock(stopped, 5000)).toBe(stopped);
  });

  it("écrit la durée en toutes lettres", () => {
    expect(copy.endBody(pauseMinutesWords(1))).toContain("pris une minute pour vous");
    expect(pauseMinutesWords(2)).toBe("deux minutes");
    expect(pauseMinutesWords(5)).toBe("cinq minutes");
  });
});

describe("semaine du jardin", () => {
  it("nomme chaque jour de lundi à dimanche, sans parler d'échec", () => {
    const days = gardenWeek({ today: "2026-11-04", week: week([true, false, false, false, false, false, false]) });
    expect(days.map((d) => d.letter)).toEqual(["L", "M", "M", "J", "V", "S", "D"]);
    expect(days[0]!.label).toBe("Lundi : une pause");
    expect(days[1]!.label).toBe("Mardi : pas de pause");
    expect(days[2]).toMatchObject({ today: true, leaf: false, label: "Mercredi, aujourd'hui : pas encore de pause" });
  });

  it("ajoute la feuille du jour sans toucher aux autres jours", () => {
    const garden = gardenSchema.parse({ leaves: 3, today: "2026-11-04", week: week([true, false, false, false, false, false, false]) });
    const next = withTodayLeaf(garden);
    expect(next.leaves).toBe(4);
    expect(next.week.map((d) => d.leaf)).toEqual([true, false, true, false, false, false, false]);
    expect(withTodayLeaf(next).leaves).toBe(5);
  });
});
