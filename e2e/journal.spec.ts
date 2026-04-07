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
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Notes textarea
    await expect(dialog.locator("#journal-text")).toBeVisible();
  });

  test("shows empty state or journal entries", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const hasEntries = await page.locator("main").locator("article, [data-slot='card']").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("Votre journal est vide").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    expect(hasEntries || hasEmpty || hasNoChild).toBeTruthy();
  });
});
