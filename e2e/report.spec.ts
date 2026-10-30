import { test, expect } from "@playwright/test";

test.describe("Carnet de consultation TDAH", () => {
  test("report route renders for any authenticated user", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 15_000 });

    await page.goto("/report");
    await expect(
      page.locator("h1", { hasText: "Carnet de consultation TDAH" }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("paid account shows the full controls and document sections", async ({
    page,
  }) => {
    await page.goto("/report");
    await page.waitForLoadState("networkidle");

    const sendButton = page.getByRole("button", { name: /^Envoyer$/ });
    const isPaid = await sendButton.isVisible().catch(() => false);

    test.skip(
      !isPaid,
      "Demo account has no active subscription — paid controls not rendered",
    );

    await expect(
      page.getByRole("button", { name: /Télécharger en PDF/ }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Synthèse de la période" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Moyennes par dimension" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Moments marquants du journal" }),
    ).toBeVisible();
    await expect(
      page.getByText("Ce n'est pas un diagnostic médical.", { exact: false }),
    ).toBeVisible();
  });

  test("document follows the PDF layout and prints on A4", async ({ page }) => {
    await page.goto("/report");
    const report = page.locator(".report-document").first();
    await expect(report).toBeVisible({ timeout: 15_000 });

    await expect(report.getByText("Rapport de suivi TDAH", { exact: true })).toBeVisible();
    await expect(report.getByText("Données saisies par", { exact: true })).toBeVisible();
    for (const name of [
      "Synthèse de la période",
      "Moyennes par dimension",
      "Traitements",
      "Moments marquants du journal",
      "Programme Barkley",
      "Liste de crise",
    ]) {
      await expect(report.getByRole("heading", { name, exact: true })).toBeVisible();
    }
    await expect(report.getByText("Jours suivis", { exact: true })).toBeVisible();

    await page.emulateMedia({ media: "print" });
    await expect(report).toBeVisible();
    await expect(page.locator(".report-controls")).toBeHidden();
    await expect(
      page.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeHidden();
  });

  test("account page links to the report page", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByText("Rapport médical").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText(/Synthèse PDF à apporter en consultation/),
    ).toBeVisible();
  });
});
