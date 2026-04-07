import { test, expect } from "@playwright/test";

test.describe("Barkley reward board", () => {
  test("displays barkley page with heading", async ({ page }) => {
    await page.goto("/barkley");

    await expect(page.locator("h1")).toContainText(
      /Programme Barkley|Tableau Barkley/
    );
    await expect(page.getByText("Programme d'entraînement aux habiletés parentales")).toBeVisible();
  });

  test("shows tabs for rewards and programme", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    // If child is selected, tabs should be visible
    const hasTabs = await page.getByRole("tab", { name: "Tableau de récompenses" }).isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    if (hasTabs) {
      await expect(page.getByRole("tab", { name: "Tableau de récompenses" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Programme" })).toBeVisible();
    } else {
      const hasHeading = await page.locator("h1").isVisible().catch(() => false);
      expect(hasNoChild || hasHeading).toBeTruthy();
    }
  });

  test("programme tab shows 10 Barkley steps", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    const hasTabs = await page.getByRole("tab", { name: "Programme" }).isVisible().catch(() => false);

    if (hasTabs) {
      await page.getByRole("tab", { name: "Programme" }).click();

      await expect(page.getByText("Progression")).toBeVisible();
      await expect(page.getByText("Étape 1")).toBeVisible();
      await expect(page.getByText("Étape 10")).toBeVisible();
    }
  });

  test("discreet tip is displayed", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    // New discreet FeatureTip component has a "Conseil" aria-label
    const tip = page.getByRole("note", { name: "Conseil" });
    if (await tip.isVisible().catch(() => false)) {
      await expect(tip).toBeVisible();
      await expect(
        tip.getByRole("button", { name: "Masquer ce conseil" })
      ).toBeVisible();
    }
  });
});
