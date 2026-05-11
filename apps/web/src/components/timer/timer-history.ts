// Local-only history of timer sessions, used to surface a descriptive
// weekly summary in the idle state. Strictly factual: counts and time
// patterns. No "% completed", no streak, no anxiogenic comparison week
// over week — see `docs/freemium-ethics-policy.md` and Phase 2 #183
// (Dr. Lefèvre's clinical guardrail).

const STORAGE_KEY = "toko.timer.history";
const MAX_RECORDS = 100;
const HISTORY_RETENTION_DAYS = 30;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_RECORDS_FOR_SUMMARY = 3;

export type TimerSessionRecord = {
  /** ISO 8601 timestamp of when the session started. */
  startedAt: string;
  /** Planned duration in seconds (sum of all steps for sequences). */
  plannedDurationSec: number;
  /** True when the session ran to its planned end. */
  completed: boolean;
  /** Set when the session was a sequence (built-in or custom). */
  sequenceId?: string;
};

export type WeeklySummary = {
  count: number;
  /** Dominant time-of-day bucket. Null when no clear peak. */
  peakPeriod: TimePeriod | null;
  /** sequenceId that appeared most often this week, if any. */
  topSequenceId: string | null;
};

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

function readHistoryRaw(): TimerSessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecord);
  } catch {
    return [];
  }
}

function isValidRecord(r: unknown): r is TimerSessionRecord {
  if (!r || typeof r !== "object") return false;
  const rec = r as Partial<TimerSessionRecord>;
  return (
    typeof rec.startedAt === "string" &&
    typeof rec.plannedDurationSec === "number" &&
    rec.plannedDurationSec >= 0 &&
    typeof rec.completed === "boolean"
  );
}

function writeHistory(records: TimerSessionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // fail silent — quota / disabled storage
  }
}

export function readTimerHistory(): TimerSessionRecord[] {
  const cutoff = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const records = readHistoryRaw().filter((r) => {
    const ts = Date.parse(r.startedAt);
    return Number.isFinite(ts) && ts >= cutoff;
  });
  return records;
}

export function recordTimerSession(record: TimerSessionRecord): void {
  const next = [...readHistoryRaw(), record].slice(-MAX_RECORDS);
  writeHistory(next);
}

export function bucketTimePeriod(date: Date): TimePeriod {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

export function computeWeeklySummary(
  records: TimerSessionRecord[],
  now: Date = new Date()
): WeeklySummary | null {
  const cutoff = now.getTime() - WEEK_MS;
  const week = records.filter((r) => {
    const ts = Date.parse(r.startedAt);
    return Number.isFinite(ts) && ts >= cutoff;
  });
  if (week.length < MIN_RECORDS_FOR_SUMMARY) return null;

  const periodCounts: Record<TimePeriod, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };
  const sequenceCounts = new Map<string, number>();
  for (const r of week) {
    periodCounts[bucketTimePeriod(new Date(r.startedAt))]++;
    if (r.sequenceId) {
      sequenceCounts.set(
        r.sequenceId,
        (sequenceCounts.get(r.sequenceId) ?? 0) + 1
      );
    }
  }
  // Peak period requires a non-trivial lead — at least 40% of sessions —
  // so we don't surface a fake pattern when the distribution is flat.
  const peak = (Object.entries(periodCounts) as [TimePeriod, number][])
    .sort(([, a], [, b]) => b - a)[0];
  const peakPeriod =
    peak && peak[1] / week.length >= 0.4 ? peak[0] : null;

  let topSequenceId: string | null = null;
  let topCount = 0;
  for (const [id, count] of sequenceCounts) {
    if (count > topCount) {
      topSequenceId = id;
      topCount = count;
    }
  }
  // Same threshold for top sequence: don't elevate a noise winner.
  if (topCount < 2) topSequenceId = null;

  return { count: week.length, peakPeriod, topSequenceId };
}
