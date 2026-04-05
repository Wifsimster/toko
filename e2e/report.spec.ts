import { test, expect } from "@playwright/test";

test.describe("Medical report (PDF export)", () => {
  test("report route renders for authenticated user", async ({ page }) => {
    await page.goto("/report");

    // Either the paywall OR the report itself should render (depends on
    // the demo account's subscription status). Both paths must match.
    const paywallHeading = page.getByText("Rapport médical — fonctionnalité Famille");
    const reportHeading = page.locator("h1", { hasText: "Rapport médical" });

    await expect(paywallHeading.or(reportHeading)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("paywall view exposes upgrade CTA and resources link", async ({
    page,
  }) => {
    await page.goto("/report");
    await page.waitForLoadState("networkidle");

    const paywallHeading = page.getByText(
      "Rapport médical — fonctionnalité Famille"
    );
    const isPaywall = await paywallHeading.isVisible().catch(() => false);

    test.skip(
      !isPaywall,
      "Demo account already has active subscription — paywall not shown"
    );

    await expect(
      page.getByRole("button", { name: /Essayer Famille 14 jours/ })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Lire les ressources gratuites/ })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Retour à mon compte/ })
    ).toBeVisible();
  });

  test("report content shows summary sections when subscription is active", async ({
    page,
  }) => {
    await page.goto("/report");
    await page.waitForLoadState("networkidle");

    const reportHeading = page.locator("h1", { hasText: "Rapport médical" });
    const isReport = await reportHeading.isVisible().catch(() => false);

    test.skip(
      !isReport,
      "Demo account has no active subscription — report content not rendered"
    );

    // Controls (hidden on print, visible on screen)
    await expect(
      page.getByRole("button", { name: /Télécharger en PDF/ })
    ).toBeVisible();

    // Document sections
    await expect(
      page.getByText("Synthèse de la période (90 jours)")
    ).toBeVisible();
    await expect(
      page.getByText("Moyennes par dimension (échelle 1-5)")
    ).toBeVisible();
    await expect(
      page.getByText("Moments marquants du journal")
    ).toBeVisible();
    await expect(
      page.getByText(/ne constitue pas un diagnostic médical/)
    ).toBeVisible();
  });

  test("account page links to the report page", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByText("Rapport médical").first()).toBeVisible();
    await expect(
      page.getByText(/Synthèse PDF à apporter en consultation/)
    ).toBeVisible();
  });
});
