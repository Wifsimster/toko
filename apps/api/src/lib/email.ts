import { env } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  // Extra SMTP headers (e.g. List-Unsubscribe for non-transactional mail).
  headers?: Record<string, string>;
};

export type SendResult =
  | { sent: true; id: string }
  | { sent: false; reason: "no-api-key" | "error"; detail?: string };

/**
 * The port every caller depends on. Routes, jobs and webhook handlers ask
 * for "send this email", not for "POST to api.resend.com" — swapping the
 * provider, or substituting a recorder in a test, touches this file and
 * nothing else.
 */
export interface EmailProvider {
  readonly name: string;
  send(payload: EmailPayload): Promise<SendResult>;
}

/**
 * Resend over plain fetch — avoids pulling in the full SDK. No-ops
 * gracefully when RESEND_API_KEY is not configured so local dev and CI
 * keep working.
 */
export const resendEmailProvider: EmailProvider = {
  name: "resend",
  async send(payload) {
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
        ...(payload.headers ? { headers: payload.headers } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      return { sent: false, reason: "error", detail };
    }

    const data = (await response.json()) as { id: string };
    return { sent: true, id: data.id };
  },
};

let activeProvider: EmailProvider = resendEmailProvider;

/**
 * Swaps the provider. Returns the previous one so a test can restore it:
 *
 *   const previous = setEmailProvider(recorder);
 *   ...
 *   setEmailProvider(previous);
 */
export function setEmailProvider(provider: EmailProvider): EmailProvider {
  const previous = activeProvider;
  activeProvider = provider;
  return previous;
}

export function getEmailProvider(): EmailProvider {
  return activeProvider;
}

export function sendEmail(payload: EmailPayload): Promise<SendResult> {
  return activeProvider.send(payload);
}

/**
 * An in-memory provider for tests: records what would have been sent and
 * reports success without touching the network.
 */
export function createRecordingEmailProvider(): EmailProvider & {
  readonly sent: EmailPayload[];
} {
  const sent: EmailPayload[] = [];
  return {
    name: "recording",
    sent,
    async send(payload) {
      sent.push(payload);
      return { sent: true, id: `recorded-${sent.length}` };
    },
  };
}
