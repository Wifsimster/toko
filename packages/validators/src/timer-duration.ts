export const TIMER_MAX_MINUTES = 99;

export const TIMER_SECOND_STEP = 5;

export const TIMER_MAX_SEC = TIMER_MAX_MINUTES * 60 + (60 - TIMER_SECOND_STEP);

export const TIMER_MINUTE_VALUES: readonly number[] = Array.from(
  { length: TIMER_MAX_MINUTES + 1 },
  (_, i) => i,
);

export const TIMER_SECOND_VALUES: readonly number[] = Array.from(
  { length: 60 / TIMER_SECOND_STEP },
  (_, i) => i * TIMER_SECOND_STEP,
);

export function clampTimerDuration(sec: number): number {
  if (!Number.isFinite(sec) || sec <= 0) return 0;
  const stepped = Math.round(sec / TIMER_SECOND_STEP) * TIMER_SECOND_STEP;
  return Math.min(TIMER_MAX_SEC, stepped);
}

export function splitTimerDuration(sec: number): { minutes: number; seconds: number } {
  const total = clampTimerDuration(sec);
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

export function composeTimerDuration(minutes: number, seconds: number): number {
  return clampTimerDuration(minutes * 60 + seconds);
}

export function resolveInitialTimerDuration(stored: string | null | undefined): number {
  if (stored == null || stored.trim() === "") return 0;
  const n = Number(stored);
  return Number.isInteger(n) ? clampTimerDuration(n) : 0;
}
