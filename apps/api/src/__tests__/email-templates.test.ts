import { describe, it, expect } from "vitest";
import {
  dailyReminderTemplate,
  weeklyDigestTemplate,
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
    });
    expect(subject).toContain("Lucas");
    expect(html).toContain("72/100");
    expect(html).toContain("↗︎");
    expect(html).toContain("<strong>6</strong>");
    expect(html).toContain("<strong>14</strong>");
  });

  it("falls back to — when consistency score is null", () => {
    const { html } = weeklyDigestTemplate({
      parentName: "Marc",
      childName: "Lucas",
      consistencyScore: null,
      moodTrend: null,
      entriesLogged: 0,
      weeklyStars: 0,
    });
    expect(html).toContain("—");
  });
});
