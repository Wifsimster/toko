// Fire-and-forget analytics ingestion. Failures are swallowed: dropping
// an event is always preferable to degrading UX.

const EVENT_NAMES = [
  "signup_completed",
  "session_started",
  "paywall_viewed",
  "sos_completed",
  "sos_helpful_rating",
  "trial_started",
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

// "Session" = activity period delimited by ≥ 30 min of inactivity, in
// line with the GA4 default. We persist the last-fire timestamp in
// localStorage (not sessionStorage) so a returning user after lunch
// fires a new session_started even if the tab is the same. Failures
// to read storage degrade gracefully — we always fire at most once
// per page-load anyway.
const SESSION_TTL_MS = 30 * 60 * 1000;
const SESSION_TS_KEY = "toko_analytics_last_session_ts";

export function trackSessionStart(): void {
  if (typeof localStorage === "undefined") return;
  if (firedOnce.has("session_started")) return;
  firedOnce.add("session_started");
  let last = 0;
  try {
    last = Number(localStorage.getItem(SESSION_TS_KEY)) || 0;
  } catch {
    last = 0;
  }
  const now = Date.now();
  if (now - last < SESSION_TTL_MS) return;
  try {
    localStorage.setItem(SESSION_TS_KEY, String(now));
  } catch {
    // Ignore — quota or privacy mode; still fire the event so we don't
    // silently lose every session for users with restrictive storage.
  }
  trackEvent("session_started");
}
