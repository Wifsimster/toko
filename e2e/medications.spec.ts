import { test, expect } from "@playwright/test";

test.describe("Medications page", () => {
  test("displays medications page with heading", async ({ page }) => {
    await page.goto("/medications");

    await expect(page.locator("h1")).toContainText("Médicaments");
    await expect(page.getByText("Gestion des traitements et rappels")).toBeVisible();
  });

  test("add medication button opens dialog", async ({ page }) => {
    await page.goto("/medications");

    await page.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByText("Nouveau médicament")).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#dose")).toBeVisible();
    await expect(page.locator("#time")).toBeVisible();
  });

  test("shows empty state or medication list", async ({ page }) => {
    await page.goto("/medications");
    await page.waitForLoadState("networkidle");

    const hasMeds = await page.getByText("Actif").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("Aucun médicament").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    expect(hasMeds || hasEmpty || hasNoChild).toBeTruthy();
  });
});
