import { describe, it, expect, afterEach } from "vitest";
import {
  createRecordingEmailProvider,
  getEmailProvider,
  resendEmailProvider,
  sendEmail,
  setEmailProvider,
  type EmailProvider,
} from "../lib/email";

// The point of the provider port: callers depend on `sendEmail`, not on
// Resend. Substituting an implementation must need no change anywhere else.

afterEach(() => {
  setEmailProvider(resendEmailProvider);
});

describe("email provider port", () => {
  it("defaults to Resend", () => {
    expect(getEmailProvider().name).toBe("resend");
  });

  it("routes sends through whichever provider is installed", async () => {
    const recorder = createRecordingEmailProvider();
    setEmailProvider(recorder);

    const result = await sendEmail({
      to: "medecin@example.fr",
      subject: "Rapport TDAH",
      html: "<p>Bonjour</p>",
    });

    expect(result).toEqual({ sent: true, id: "recorded-1" });
    expect(recorder.sent).toHaveLength(1);
    expect(recorder.sent[0]?.to).toBe("medecin@example.fr");
  });

  it("returns the previous provider so a caller can restore it", () => {
    const first = createRecordingEmailProvider();
    const previous = setEmailProvider(first);
    expect(previous).toBe(resendEmailProvider);
    expect(setEmailProvider(previous)).toBe(first);
  });

  it("surfaces a provider failure instead of throwing", async () => {
    const failing: EmailProvider = {
      name: "failing",
      async send() {
        return { sent: false, reason: "error", detail: "smtp down" };
      },
    };
    setEmailProvider(failing);

    await expect(
      sendEmail({ to: "a@b.fr", subject: "x", html: "<p>x</p>" }),
    ).resolves.toEqual({ sent: false, reason: "error", detail: "smtp down" });
  });
});
