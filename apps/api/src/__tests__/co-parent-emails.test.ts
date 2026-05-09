import { describe, it, expect } from "vitest";
import {
  buildInviteEmail,
  buildAcceptanceEmail,
} from "../lib/co-parent-emails";

describe("buildInviteEmail", () => {
  const baseParams = {
    inviterName: "Sophie",
    childName: "Léa",
    acceptUrl: "https://app.toko.test/invite/abc123",
    expiresAt: new Date("2026-05-23T00:00:00Z"),
  };

  it("renders French subject-area copy with inviter and child names", () => {
    const html = buildInviteEmail(baseParams);
    expect(html).toContain("Sophie aimerait partager avec vous le carnet de Léa");
    expect(html).toContain("Tokō · invitation");
  });

  it("escapes HTML in the inviter and child names", () => {
    const html = buildInviteEmail({
      ...baseParams,
      inviterName: "Sophie & co <script>",
      childName: "L\"éa\"",
    });
    expect(html).toContain("Sophie &amp; co &lt;script&gt;");
    expect(html).toContain("L&quot;éa&quot;");
    expect(html).not.toContain("<script>");
  });

  it("includes the accept URL in both the button and the fallback line", () => {
    const html = buildInviteEmail(baseParams);
    const occurrences = html.match(/abc123/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });

  it("formats the expiry date in French long form", () => {
    const html = buildInviteEmail(baseParams);
    expect(html).toMatch(/L'invitation expire le 23 mai 2026/);
  });

  it("includes the silent-discard line so unsolicited recipients can ignore", () => {
    const html = buildInviteEmail(baseParams);
    expect(html).toContain("aucun compte n'est créé sans votre action");
  });
});

describe("buildAcceptanceEmail", () => {
  const baseParams = {
    inviterName: "Sophie",
    acceptorLabel: "Marc",
    childName: "Léa",
    appUrl: "https://app.toko.test",
  };

  it("addresses the inviter by name and announces the acceptor joined", () => {
    const html = buildAcceptanceEmail(baseParams);
    expect(html).toContain("Marc a rejoint le carnet de Léa");
    expect(html).toContain("Sophie, votre invitation a été acceptée");
  });

  it("falls back to a neutral salutation when inviter name is empty", () => {
    const html = buildAcceptanceEmail({ ...baseParams, inviterName: "" });
    expect(html).toContain("Bonjour, votre invitation a été acceptée");
  });

  it("links the dashboard from the app URL", () => {
    const html = buildAcceptanceEmail(baseParams);
    expect(html).toContain('href="https://app.toko.test/dashboard"');
  });

  it("escapes HTML in all dynamic fields", () => {
    const html = buildAcceptanceEmail({
      inviterName: "<S>",
      acceptorLabel: "<M>",
      childName: "<L>",
      appUrl: "https://app.toko.test",
    });
    expect(html).toContain("&lt;S&gt;");
    expect(html).toContain("&lt;M&gt;");
    expect(html).toContain("&lt;L&gt;");
    expect(html).not.toMatch(/<S>|<M>|<L>/);
  });

  it("reminds the inviter they remain the subscription holder", () => {
    const html = buildAcceptanceEmail(baseParams);
    expect(html).toContain("Vous restez la personne qui gère l'abonnement");
  });
});
