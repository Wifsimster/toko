import { describe, expect, it } from "vitest";
import {
  TIMER_MAX_SEC,
  TIMER_MINUTE_VALUES,
  TIMER_SECOND_VALUES,
  clampTimerDuration,
  composeTimerDuration,
  resolveInitialTimerDuration,
  splitTimerDuration,
} from "../timer-duration";

describe("clampTimerDuration", () => {
  it("arrondit au pas de 5 s", () => {
    expect(clampTimerDuration(92)).toBe(90);
    expect(clampTimerDuration(93)).toBe(95);
  });

  it("borne entre 0 et 99 min 55 s", () => {
    expect(clampTimerDuration(-30)).toBe(0);
    expect(clampTimerDuration(2 * 60 * 60)).toBe(TIMER_MAX_SEC);
    expect(TIMER_MAX_SEC).toBe(99 * 60 + 55);
  });

  it("ramène une valeur non finie à 0", () => {
    expect(clampTimerDuration(Number.NaN)).toBe(0);
    expect(clampTimerDuration(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("roues minutes / secondes", () => {
  it("chaque position des roues donne une durée qui revient à la même position", () => {
    for (const m of TIMER_MINUTE_VALUES) {
      for (const s of TIMER_SECOND_VALUES) {
        expect(splitTimerDuration(composeTimerDuration(m, s))).toEqual({ minutes: m, seconds: s });
      }
    }
  });

  it("place une durée hors pas sur la position la plus proche", () => {
    expect(splitTimerDuration(10 * 60 + 58)).toEqual({ minutes: 11, seconds: 0 });
  });

  it("la dernière position de la roue est la durée maximale", () => {
    const m = TIMER_MINUTE_VALUES.at(-1)!;
    const s = TIMER_SECOND_VALUES.at(-1)!;
    expect(composeTimerDuration(m, s)).toBe(TIMER_MAX_SEC);
  });
});

describe("resolveInitialTimerDuration", () => {
  it("reprend la dernière durée lancée", () => {
    expect(resolveInitialTimerDuration("300")).toBe(300);
  });

  it("sans durée enregistrée, n'impose rien (0)", () => {
    expect(resolveInitialTimerDuration(null)).toBe(0);
    expect(resolveInitialTimerDuration(undefined)).toBe(0);
    expect(resolveInitialTimerDuration("")).toBe(0);
  });

  it("ignore une valeur illisible", () => {
    expect(resolveInitialTimerDuration("dix")).toBe(0);
    expect(resolveInitialTimerDuration("12.5")).toBe(0);
    expect(resolveInitialTimerDuration("-60")).toBe(0);
  });

  it("borne une valeur trop grande (ancienne version, stockage modifié)", () => {
    expect(resolveInitialTimerDuration("100000")).toBe(TIMER_MAX_SEC);
  });
});
