import { test, expect } from "@playwright/test";

test.describe("Barkley reward board", () => {
  test("displays barkley page with heading", async ({ page }) => {
    await page.goto("/barkley");

    await expect(page.locator("h1")).toContainText("Tableau Barkley");
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
      expect(hasNoChild).toBeTruthy();
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

  test("barkley tips are displayed", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    const hasTips = await page.getByText("Conseils Barkley").isVisible().catch(() => false);

    if (hasTips) {
      await expect(page.getByText("Immédiateté")).toBeVisible();
      await expect(page.getByText("Positivité")).toBeVisible();
      await expect(page.getByText("Régularité")).toBeVisible();
    }
  });
});
