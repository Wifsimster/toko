import { describe, it, expect } from "vitest";
import {
  accountExistsEmail,
  finishAccountEmail,
  dailyReminderTemplate,
  weeklyDigestTemplate,
  resetPasswordEmail,
  verificationEmail,
  verificationReminderEmail,
} from "../lib/email-templates";

describe("dailyReminderTemplate", () => {
  it("produces French subject + html and escapes names", () => {
    const { subject, html } = dailyReminderTemplate("Sophie & co <script>");
    expect(subject).toMatch(/rappel/i);
    expect(html).toContain("Bonjour Sophie &amp; co &lt;script&gt;");
    expect(html).toContain("Logger une humeur");
  });
});

describe("weeklyDigestTemplate", () => {
  it("shows consistency score + trend arrow", () => {
    const { subject, html } = weeklyDigestTemplate({
      parentName: "Marc",
      childName: "Lucas",
      consistencyScore: 72,
      moodTrend: "up",
      entriesLogged: 6,
      weeklyStars: 14,
      streak: 5,
      topTags: ["crise", "école", "victoire"],
      bestDay: "2026-04-02",
      hardestDay: "2026-03-31",
    });
    expect(subject).toContain("Lucas");
    expect(html).toContain("72/100");
    expect(html).toContain("↗︎");
    expect(html).toContain("<strong>6</strong>");
    expect(html).toContain("<strong>14</strong>");
    expect(html).toContain("5 jours");
    expect(html).toContain("crise, école, victoire");
    expect(html).toContain("bilan consultation");
  });

  it("falls back to — when consistency score is null", () => {
    const { html } = weeklyDigestTemplate({
      parentName: "Marc",
      childName: "Lucas",
      consistencyScore: null,
      moodTrend: null,
      entriesLogged: 0,
      weeklyStars: 0,
      streak: 0,
      topTags: [],
      bestDay: null,
      hardestDay: null,
    });
    expect(html).toContain("—");
  });
});

describe("resetPasswordEmail", () => {
  const url = "https://toko.app/reset-password?token=abc123";

  it("produces a French security email with the reset link", () => {
    const { subject, html } = resetPasswordEmail({ url });
    expect(subject).toMatch(/mot de passe/i);
    expect(html).toContain(url);
    expect(html).toContain("Choisir un nouveau mot de passe");
  });

  it("does not use the reminder-preferences footer", () => {
    // A reset email is transactional/security — it must not claim the
    // user "enabled reminders" or link to an opt-out they can't reach.
    const { html } = resetPasswordEmail({ url });
    expect(html).not.toContain("activé les rappels");
    expect(html).not.toContain("Gérer mes notifications");
    expect(html).toContain("sécurité de ton compte");
  });
});

describe("verificationEmail", () => {
  const url = "https://toko.app/api/auth/verify-email?token=abc123";

  it("produces a French security email with the verification link and a neutral greeting", () => {
    const { subject, html } = verificationEmail({ url });
    expect(subject).toMatch(/adresse e-mail/i);
    expect(html).toContain(url);
    expect(html).toContain("Bonjour,");
    expect(html).toContain("Confirmer mon adresse e-mail");
  });

  it("uses the security footer, not the reminder one", () => {
    const { html } = verificationEmail({ url });
    expect(html).not.toContain("Gérer mes notifications");
    expect(html).toContain("sécurité de ton compte");
  });
});

describe("accountExistsEmail", () => {
  it("points to the sign-in page only, greets neutrally, uses the security footer", () => {
    const { subject, html } = accountExistsEmail({ loginUrl: "https://toko.app/login" });
    expect(subject).toMatch(/déjà un compte/);
    expect(html).toContain("Bonjour,");
    expect(html.match(/href="([^"]+)"/g)).toEqual(['href="https://toko.app/login"']);
    expect(html).toContain("sécurité de ton compte");
  });
});

describe("finishAccountEmail", () => {
  it("offers to choose a password through the reset link, without saying an account existed", () => {
    const url = "https://toko.app/reset-password?token=abc";
    const { subject, html } = finishAccountEmail({ url });
    expect(subject).toMatch(/Finalisez votre compte/);
    expect(html).toContain("Bonjour,");
    expect(html).toContain(`href="${url}"`);
    expect(html).toContain("Choisir mon mot de passe");
    expect(html).not.toMatch(/déjà/);
    expect(html).toContain("sécurité de ton compte");
  });
});

describe("verificationReminderEmail", () => {
  const url = "https://toko.app/api/auth/verify-email?token=abc123";

  it("carries the verification link and the single confirm action", () => {
    for (const step of [1, 2, 3] as const) {
      const { html } = verificationReminderEmail({ url, step });
      expect(html).toContain(url);
      expect(html).toContain("Confirmer mon adresse e-mail");
      expect(html).toContain("Bonjour,");
    }
  });

  it("varies the subject line per step so messages don't collapse", () => {
    const subjects = ([1, 2, 3] as const).map(
      (step) => verificationReminderEmail({ url, step }).subject,
    );
    expect(new Set(subjects).size).toBe(3);
  });

  it("announces the third reminder as the last one", () => {
    const { html } = verificationReminderEmail({ url, step: 3 });
    expect(html).toContain("dernier message");
  });

  it("uses the security footer, not the reminder-preferences one", () => {
    const { html } = verificationReminderEmail({ url, step: 1 });
    expect(html).not.toContain("Gérer mes notifications");
    expect(html).toContain("sécurité de ton compte");
  });
});

