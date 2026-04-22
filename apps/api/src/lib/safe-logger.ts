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

function emit(level: "info" | "warn" | "error", event: string, data?: unknown) {
  const payload = data === undefined ? "" : JSON.stringify(redact(data));
  const line = `[${level}] ${event}${payload ? " " + payload : ""}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, data?: unknown) => emit("info", event, data),
  warn: (event: string, data?: unknown) => emit("warn", event, data),
  error: (event: string, data?: unknown) => emit("error", event, data),
};
