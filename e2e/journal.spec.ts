import { test, expect } from "@playwright/test";

test.describe("Journal page", () => {
  test("displays journal page with heading", async ({ page }) => {
    await page.goto("/journal");

    await expect(page.locator("h1")).toContainText("Journal");
    await expect(page.getByText("Notes et observations quotidiennes")).toBeVisible();
  });

  test("write entry button opens dialog with form", async ({ page }) => {
    await page.goto("/journal");

    await page.getByRole("button", { name: "Écrire" }).click();

    await expect(page.getByText("Nouvelle entrée")).toBeVisible();
    await expect(page.getByText("Humeur du jour")).toBeVisible();

    // Tags should be visible
    await expect(page.getByText("École")).toBeVisible();
    await expect(page.getByText("Victoire")).toBeVisible();
    await expect(page.getByText("Crise")).toBeVisible();

    // Notes textarea
    await expect(page.locator("#journal-text")).toBeVisible();
  });

  test("shows empty state or journal entries", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const hasEntries = await page.locator("[class*=Card]").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("Votre journal est vide").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    expect(hasEntries || hasEmpty || hasNoChild).toBeTruthy();
  });
});
