import type { EventDailyRow, EventTotalRow } from "@/hooks/use-admin-analytics";

export const EVENT_LABELS: Record<string, string> = {
  signup_completed: "Inscriptions",
  session_started: "Sessions",
  paywall_viewed: "Paywall vu",
  sos_completed: "S.O.S. terminé",
  sos_helpful_rating: "S.O.S. noté",
  trial_started: "Essai démarré",
  subscription_started: "Abonnement démarré",
  subscription_canceled: "Abonnement annulé",
};

export const EVENT_COLORS: Record<string, string> = {
  signup_completed: "#16a34a",
  session_started: "#10b981",
  paywall_viewed: "#f59e0b",
  sos_completed: "#3b82f6",
  sos_helpful_rating: "#8b5cf6",
  trial_started: "#ef4444",
  subscription_started: "#0ea5e9",
  subscription_canceled: "#64748b",
};

export function formatPercent(rate: number | null): string {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)} %`;
}

export function formatNumber(value: number | null, fractionDigits: number): string {
  if (value === null) return "—";
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

// Humanises a seconds count into "X min", "X h", "X j", admins read
// the dashboard quickly and a raw seconds figure is meaningless past
// a few minutes.
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "—";
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(seconds / 3600);
  if (hours < 48) return `${hours} h`;
  const days = Math.round(seconds / 86400);
  return `${days} j`;
}

export function pivotByDay(rows: EventDailyRow[]) {
  const map = new Map<string, Record<string, number | string>>();
  for (const row of rows) {
    let entry = map.get(row.date);
    if (!entry) {
      entry = { date: row.date };
      map.set(row.date, entry);
    }
    entry[row.eventName] = row.count;
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

export function totalsToMap(rows: EventTotalRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) out[row.eventName] = row.count;
  return out;
}
