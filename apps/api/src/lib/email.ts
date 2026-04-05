import { env } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export type SendResult =
  | { sent: true; id: string }
  | { sent: false; reason: "no-api-key" | "error"; detail?: string };

// Minimal Resend client via fetch — avoids pulling in the full SDK.
// No-ops gracefully when RESEND_API_KEY is not configured so local dev and
// CI keep working.
export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "no-api-key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    return { sent: false, reason: "error", detail };
  }

  const data = (await response.json()) as { id: string };
  return { sent: true, id: data.id };
}
