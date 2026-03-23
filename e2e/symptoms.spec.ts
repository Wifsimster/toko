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

    await expect(page.getByText("Nouveau relevé")).toBeVisible();
    // Symptom form fields
    await expect(page.getByText("Agitation")).toBeVisible();
    await expect(page.getByText("Concentration")).toBeVisible();
    await expect(page.getByText("Impulsivité")).toBeVisible();
    await expect(page.getByText("Humeur")).toBeVisible();
    await expect(page.getByText("Sommeil")).toBeVisible();
  });

  test("shows empty state or symptom list", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const hasSymptoms = await page.locator("[class*=Card]").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("Aucun relevé").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    expect(hasSymptoms || hasEmpty || hasNoChild).toBeTruthy();
  });
});
