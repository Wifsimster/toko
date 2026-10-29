const EVENT_NAMES = [
  "signup_completed",
  "session_started",
  "paywall_viewed",
  "sos_completed",
  "sos_helpful_rating",
  "trial_started",
  "pricing_page_viewed",
  "pricing_cta_clicked",
  "article_viewed",
  "cta_clicked",
  "signup_started",
  "checkout_started",
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

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string | number | boolean>) => void };
  }
}

function flatProperties(properties: Record<string, unknown>) {
  const flat: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (["string", "number", "boolean"].includes(typeof value)) {
      flat[key] = value as string | number | boolean;
    }
  }
  return flat;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): void {
  window.umami?.track(eventName, flatProperties(properties));
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

export function trackEventOnce(
  dedupeKey: string,
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): void {
  if (firedOnce.has(dedupeKey)) return;
  firedOnce.add(dedupeKey);
  trackEvent(eventName, properties);
}

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
  }
  trackEvent("session_started");
}
