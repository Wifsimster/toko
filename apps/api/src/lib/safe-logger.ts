// Business rule F5: no PII in application logs.
// Wraps console.{info,warn,error} with a redaction layer that scrubs the
// documented set of sensitive fields and masks email-like strings.

const FORBIDDEN_KEYS = new Set([
  "email",
  "name",
  "firstName",
  "lastName",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "ipAddress",
  "ip",
  "address",
  "phone",
]);

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated]";
  if (value == null) return value;
  if (typeof value === "string") {
    return value.replace(EMAIL_RE, "[email]");
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redact(value.message, depth + 1),
      stack: typeof value.stack === "string" ? redact(value.stack, depth + 1) : undefined,
    };
  }
  if (Array.isArray(value)) {
    return value.map((v) => redact(v, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(k)) {
        out[k] = "[redacted]";
      } else {
        out[k] = redact(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

// Single-line JSON emitter so log scrapers (Loki/Promtail, Grafana
// Alloy, Datadog, …) can index `level`, `event`, and any structured
// fields directly without a custom regex. The previous prefix format
// (`[info] event {...}`) made it impossible to extract per-event-type
// label values like `stripe_webhook_total{event_type, status}` cleanly.
function emit(level: "info" | "warn" | "error", event: string, data?: unknown) {
  const base = {
    level,
    event,
    ts: new Date().toISOString(),
  };
  // Most call sites pass a plain object — spread it so each field
  // becomes a top-level key the scraper can index. Errors and other
  // non-object payloads fall back to a single `data` field so we never
  // accidentally spread a string into character-indexed entries.
  const redacted = data === undefined ? undefined : redact(data);
  const merged =
    redacted &&
    typeof redacted === "object" &&
    !Array.isArray(redacted)
      ? { ...base, ...(redacted as Record<string, unknown>) }
      : redacted === undefined
      ? base
      : { ...base, data: redacted };
  const line = JSON.stringify(merged);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, data?: unknown) => emit("info", event, data),
  warn: (event: string, data?: unknown) => emit("warn", event, data),
  error: (event: string, data?: unknown) => emit("error", event, data),
};
