export const PAUSE_PHASES = ["inhale", "hold", "exhale", "rest"] as const;
export type PausePhase = (typeof PAUSE_PHASES)[number];
export const PAUSE_PHASE_MS = 4000;

export function pausePhaseAt(elapsedMs: number): PausePhase {
  const safe = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  return PAUSE_PHASES[Math.floor(safe / PAUSE_PHASE_MS) % PAUSE_PHASES.length]!;
}

export function formatCountdown(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
