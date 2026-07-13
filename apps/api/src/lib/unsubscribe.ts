import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// Signed, stateless one-click unsubscribe tokens (RFC 8058) for the
// non-transactional emails (daily/evening reminders, weekly digest). The
// token carries the user id and the email category, signed with
// BETTER_AUTH_SECRET so no per-token DB row is needed.

export type EmailCategory = "daily" | "evening" | "weekly";

// The opt-in column each category maps to, used by the unsubscribe route.
export const CATEGORY_COLUMN: Record<EmailCategory, string> = {
  daily: "dailyReminderOptIn",
  evening: "eveningReminderOptIn",
  weekly: "weeklyDigestOptIn",
};

function sign(payload: string): string {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(payload)
    .digest("base64url");
}

export function makeUnsubscribeToken(userId: string, category: EmailCategory): string {
  const payload = `${userId}:${category}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifyUnsubscribeToken(
  token: string
): { userId: string; category: EmailCategory } | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const sep = payload.indexOf(":");
  if (sep <= 0) return null;
  const userId = payload.slice(0, sep);
  const category = payload.slice(sep + 1);
  if (category !== "daily" && category !== "evening" && category !== "weekly") {
    return null;
  }
  return { userId, category };
}

// Headers that make an email one-click unsubscribable in Gmail/Apple Mail etc.
export function unsubscribeHeaders(
  userId: string,
  category: EmailCategory
): Record<string, string> {
  const url = `${env.APP_URL}/api/unsubscribe?token=${makeUnsubscribeToken(userId, category)}`;
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
