import { test, expect } from "@playwright/test";

test.describe("Symptom CRUD operations", () => {
  test("create a new symptom entry via form", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", { name: "Ajouter" });

    if (!(await addBtn.isVisible().catch(() => false))) {
      // No child selected, skip
      return;
    }

    await addBtn.click();
    await expect(page.getByText("Nouveau relevé")).toBeVisible();

    // Fill optional fields
    await page.locator("#context").fill("Journée d'école");
    await page.locator("#notes").fill("Bonne journée dans l'ensemble");

    // Submit the form
    await page.getByRole("button", { name: "Enregistrer" }).click();

    // Dialog should close after success
    await expect(page.getByText("Nouveau relevé")).not.toBeVisible({ timeout: 5000 });
  });

  test("symptom form shows all 7 dimensions with sliders", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", { name: "Ajouter" });

    if (!(await addBtn.isVisible().catch(() => false))) {
      return;
    }

    await addBtn.click();

    await expect(page.getByText("Agitation")).toBeVisible();
    await expect(page.getByText("Concentration")).toBeVisible();
    await expect(page.getByText("Impulsivité")).toBeVisible();
    await expect(page.getByText("Régulation émotionnelle")).toBeVisible();
    await expect(page.getByText("Sommeil")).toBeVisible();
    await expect(page.getByText("Comportement social")).toBeVisible();
    await expect(page.getByText("Autonomie")).toBeVisible();

    // Context and notes fields
    await expect(page.locator("#context")).toBeVisible();
    await expect(page.locator("#notes")).toBeVisible();
  });

  test("symptom form has context and notes placeholders", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page.getByRole("button", { name: "Ajouter" });

    if (!(await addBtn.isVisible().catch(() => false))) {
      return;
    }

    await addBtn.click();

    await expect(page.locator("#context")).toHaveAttribute(
      "placeholder",
      "Ex: journée d'école, week-end..."
    );
    await expect(page.locator("#notes")).toHaveAttribute(
      "placeholder",
      "Observations libres..."
    );
  });
});
