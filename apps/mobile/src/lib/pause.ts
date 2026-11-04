import type { Garden } from "@focusflow/validators";

import { DOW_LABELS, pause as copy } from "./copy";

export const PAUSE_DEFAULT_MINUTES = 2;

export type PauseClock = { accumulatedMs: number; startedAt: number | null };

export function startClock(now: number): PauseClock {
  return { accumulatedMs: 0, startedAt: now };
}

export function stopClock(clock: PauseClock, now: number): PauseClock {
  if (clock.startedAt === null) return clock;
  return { accumulatedMs: clock.accumulatedMs + Math.max(0, now - clock.startedAt), startedAt: null };
}

export function resumeClock(clock: PauseClock, now: number): PauseClock {
  if (clock.startedAt !== null) return clock;
  return { accumulatedMs: clock.accumulatedMs, startedAt: now };
}

export function clockElapsed(clock: PauseClock, now: number): number {
  return clock.accumulatedMs + (clock.startedAt === null ? 0 : Math.max(0, now - clock.startedAt));
}

export function remainingMs(minutes: number, elapsedMs: number): number {
  return Math.max(0, minutes * 60_000 - elapsedMs);
}

export function splitCountdown(ms: number): { minutes: number; seconds: number } {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

export function formatCountdown(ms: number): string {
  const { minutes, seconds } = splitCountdown(ms);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function pauseMinutesWords(minutes: number): string {
  return copy.minutesWords[minutes] ?? `${minutes} minutes`;
}

export type GardenWeekDay = { date: string; letter: string; label: string; leaf: boolean; today: boolean };

export function gardenWeek(garden: Pick<Garden, "today" | "week">): GardenWeekDay[] {
  return garden.week.map((day, i) => {
    const today = day.date === garden.today;
    return {
      date: day.date,
      letter: DOW_LABELS[i] ?? "",
      label: copy.dayLabel(copy.weekDays[i] ?? day.date, day.leaf, today),
      leaf: day.leaf,
      today,
    };
  });
}

export function withTodayLeaf(garden: Garden): Garden {
  return {
    ...garden,
    leaves: garden.leaves + 1,
    week: garden.week.map((day) => (day.date === garden.today ? { ...day, leaf: true } : day)),
  };
}
