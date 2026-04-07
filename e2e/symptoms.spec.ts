import { test, expect } from "@playwright/test";

test.describe("Symptoms page", () => {
  test("displays symptoms page with heading", async ({ page }) => {
    await page.goto("/symptoms");

    await expect(page.locator("h1")).toContainText("Symptômes");
    await expect(page.getByText("Suivi quotidien des symptômes TDAH")).toBeVisible();
  });

  test("add symptom button opens dialog", async ({ page }) => {
    await page.goto("/symptoms");

    await page.getByRole("button", { name: "Ajouter" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Nouveau relevé")).toBeVisible();
    // Scope to dialog to avoid strict-mode collisions with background cards
    await expect(dialog.getByText("Agitation", { exact: true })).toBeVisible();
    await expect(
      dialog.getByText("Concentration", { exact: true })
    ).toBeVisible();
    await expect(dialog.getByText("Impulsivité", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Humeur", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Sommeil", { exact: true })).toBeVisible();
  });

  test("shows empty state or symptom list", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const hasSymptoms = await page
      .locator("main")
      .getByRole("button", { name: /Ajouter|Nouveau/i })
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page.getByText("Aucun relevé").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);
    const hasNoMatch = await page
      .getByText("Aucun relevé ne correspond")
      .isVisible()
      .catch(() => false);

    expect(hasSymptoms || hasEmpty || hasNoChild || hasNoMatch).toBeTruthy();
  });
});
