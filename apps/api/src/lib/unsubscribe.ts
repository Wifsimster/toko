import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export type EmailCategory = "daily" | "evening" | "weekly" | "formation";

export const CATEGORY_COLUMN: Record<EmailCategory, string> = {
  daily: "dailyReminderOptIn",
  evening: "eveningReminderOptIn",
  weekly: "weeklyDigestOptIn",
  formation: "formationReminderOptIn",
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
  if (
    category !== "daily" &&
    category !== "evening" &&
    category !== "weekly" &&
    category !== "formation"
  ) {
    return null;
  }
  return { userId, category };
}

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
