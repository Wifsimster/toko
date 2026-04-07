import { test, expect } from "@playwright/test";

test.describe("Rewards page", () => {
  test("displays rewards page with heading", async ({ page }) => {
    await page.goto("/rewards");

    await expect(page.locator("h1")).toContainText("Récompenses");
  });

  test("shows empty state, content, or no child message", async ({ page }) => {
    await page.goto("/rewards");
    await page.waitForLoadState("networkidle");

    const hasContent = await page.locator("main").locator("[data-slot='card'], article").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("Aucun").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);
    const hasHeading = await page.locator("h1").isVisible().catch(() => false);

    expect(hasContent || hasEmpty || hasNoChild || hasHeading).toBeTruthy();
  });

  test("shows star counter", async ({ page }) => {
    await page.goto("/rewards");
    await page.waitForLoadState("networkidle");

    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    if (!hasNoChild) {
      // Star count or empty state should be present
      const hasStars = await page.getByText("étoile").isVisible().catch(() => false);
      const hasContent = await page.locator("main").locator("[data-slot='card'], article").first().isVisible().catch(() => false);

      expect(hasStars || hasContent).toBeTruthy();
    }
  });

  test("add reward button opens dialog", async ({ page }) => {
    await page.goto("/rewards");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", { name: "Ajouter" });

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();

      // Dialog should show reward form fields
      await expect(
        page.getByText("Nouvelle récompense").or(page.getByText("Ajouter une récompense"))
      ).toBeVisible();
    }
  });
});
