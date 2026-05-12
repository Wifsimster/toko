// Fire-and-forget analytics ingestion. Failures are swallowed: dropping
// an event is always preferable to degrading UX.

const EVENT_NAMES = [
  "signup_completed",
  "paywall_viewed",
  "sos_completed",
] as const;

export type AnalyticsEventName = (typeof EVENT_NAMES)[number];

const SESSION_STORAGE_KEY = "toko_analytics_session";
const firedOnce = new Set<string>();

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "ssr";
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return "unavailable";
  }
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): void {
  if (typeof fetch === "undefined") return;
  void fetch("/api/events", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      properties,
      sessionId: getSessionId(),
    }),
  }).catch(() => {});
}

// Fires `eventName` at most once per session for a given dedupe key.
// Used by PremiumGate so a user landing on /insights doesn't spam the
// pipeline if the gate re-mounts during a single visit.
export function trackEventOnce(
  dedupeKey: string,
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): void {
  if (firedOnce.has(dedupeKey)) return;
  firedOnce.add(dedupeKey);
  trackEvent(eventName, properties);
}
