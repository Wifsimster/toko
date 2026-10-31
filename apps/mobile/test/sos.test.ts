import { describe, expect, it } from "vitest";
import fr from "../../web/src/lib/i18n/locales/fr.json";
import { sos } from "../src/lib/copy";
import {
  BREATH_CYCLE_MS,
  BREATH_PHASE_MS,
  SOS_CLOSED,
  breathCircleScale,
  breathLevelAt,
  breathPhaseAt,
  sosDismiss,
  sosReducer,
  type SosState,
} from "../src/lib/sos";

describe("parcours SOS", () => {
  it("s'ouvre sur le choix des techniques", () => {
    expect(sosReducer(SOS_CLOSED, { type: "open" })).toEqual({ open: true, technique: null });
  });

  it("ouvre une technique puis revient au choix", () => {
    const open = sosReducer(SOS_CLOSED, { type: "open" });
    const picked = sosReducer(open, { type: "select", technique: "breathing" });
    expect(picked).toEqual({ open: true, technique: "breathing" });
    expect(sosReducer(picked, { type: "back" })).toEqual({ open: true, technique: null });
  });

  it("ferme depuis n'importe quel écran", () => {
    const picked: SosState = { open: true, technique: "sensory" };
    expect(sosReducer(picked, { type: "close" })).toEqual(SOS_CLOSED);
  });

  it("ignore un choix ou un retour quand le SOS est fermé", () => {
    expect(sosReducer(SOS_CLOSED, { type: "select", technique: "diversion" })).toBe(SOS_CLOSED);
    expect(sosReducer(SOS_CLOSED, { type: "back" })).toBe(SOS_CLOSED);
  });

  it("le retour système revient au choix avant de fermer", () => {
    expect(sosDismiss({ open: true, technique: "diversion" })).toEqual({ type: "back" });
    expect(sosDismiss({ open: true, technique: null })).toEqual({ type: "close" });
  });

  it("reprend toujours au choix après une fermeture", () => {
    const picked: SosState = { open: true, technique: "breathing" };
    const closed = sosReducer(picked, { type: "close" });
    expect(sosReducer(closed, { type: "open" }).technique).toBeNull();
  });
});

describe("respiration guidée", () => {
  it("enchaîne inspirez, retenez, expirez, pause toutes les 4 s", () => {
    const at = (n: number) => breathPhaseAt(n * BREATH_PHASE_MS + 1);
    expect([0, 1, 2, 3, 4, 5].map(at)).toEqual(["inhale", "hold", "exhale", "pause", "inhale", "hold"]);
    expect(BREATH_CYCLE_MS).toBe(16000);
  });

  it("suit le cercle : 0 → 1 à l'inspiration, 1 en rétention, 1 → 0 à l'expiration, 0 en pause", () => {
    expect(breathLevelAt(0)).toBe(0);
    expect(breathLevelAt(2000)).toBeCloseTo(0.5, 5);
    expect(breathLevelAt(4000)).toBe(1);
    expect(breathLevelAt(6000)).toBe(1);
    expect(breathLevelAt(10000)).toBeCloseTo(0.5, 5);
    expect(breathLevelAt(12000)).toBe(0);
    expect(breathLevelAt(14000)).toBe(0);
    expect(breathLevelAt(BREATH_CYCLE_MS + 4000)).toBe(1);
  });

  it("garde le niveau dans [0, 1] et le cercle entre 0,55 et 1", () => {
    for (let t = 0; t < BREATH_CYCLE_MS * 2; t += 137) {
      const level = breathLevelAt(t);
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    }
    expect(breathCircleScale(0)).toBe(0.55);
    expect(breathCircleScale(1)).toBe(1);
  });
});

describe("textes SOS alignés sur le web", () => {
  it("reprend exactement les textes de fr.json", () => {
    expect(JSON.parse(JSON.stringify(sos))).toEqual(fr.sos);
  });
});
