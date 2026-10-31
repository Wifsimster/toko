export type SosTechnique = "breathing" | "sensory" | "diversion";

export type SosState = { open: boolean; technique: SosTechnique | null };

export type SosAction =
  | { type: "open" }
  | { type: "select"; technique: SosTechnique }
  | { type: "back" }
  | { type: "close" };

export const SOS_CLOSED: SosState = { open: false, technique: null };

export function sosReducer(state: SosState, action: SosAction): SosState {
  switch (action.type) {
    case "open":
      return { open: true, technique: null };
    case "select":
      return state.open ? { open: true, technique: action.technique } : state;
    case "back":
      return state.open ? { open: true, technique: null } : state;
    case "close":
      return SOS_CLOSED;
  }
}

export function sosDismiss(state: SosState): SosAction {
  return state.technique ? { type: "back" } : { type: "close" };
}

export const BREATH_PHASES = ["inhale", "hold", "exhale", "pause"] as const;
export type BreathPhase = (typeof BREATH_PHASES)[number];

export const BREATH_PHASE_MS = 4000;
export const BREATH_CYCLE_MS = BREATH_PHASE_MS * BREATH_PHASES.length;
export const BREATH_CIRCLE_MIN = 0.55;

export function breathPhaseAt(elapsedMs: number): BreathPhase {
  const i = Math.floor((Math.max(0, elapsedMs) % BREATH_CYCLE_MS) / BREATH_PHASE_MS);
  return BREATH_PHASES[i]!;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function breathLevelAt(elapsedMs: number): number {
  const phase = (Math.max(0, elapsedMs) % BREATH_CYCLE_MS) / BREATH_PHASE_MS;
  if (phase < 1) return easeInOut(phase);
  if (phase < 2) return 1;
  if (phase < 3) return 1 - easeInOut(phase - 2);
  return 0;
}

export function breathCircleScale(level: number): number {
  return BREATH_CIRCLE_MIN + (1 - BREATH_CIRCLE_MIN) * level;
}

export const BREATH_BODY_SCALE = { x: 0.06, y: 0.08 } as const;
export const BREATH_MACRON_LIFT = 5;
