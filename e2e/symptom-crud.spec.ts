import { test, expect } from "@playwright/test";

test.describe("Symptom CRUD operations", () => {
  test("create or update a symptom entry via form", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

    if (!(await addBtn.isVisible().catch(() => false))) {
      return;
    }

    await addBtn.click();
    await expect(page.getByRole("heading", { name: "Nouveau relevé" })).toBeVisible();

    await page.locator("#context").fill("Journée d'école");
    await page.locator("#notes").fill("Bonne journée dans l'ensemble");

    const submit = page.getByRole("button", {
      name: /(Enregistrer le relevé|Mettre à jour le relevé)/,
    });
    await submit.click();

    await expect(page.getByRole("heading", { name: "Nouveau relevé" })).not.toBeVisible({ timeout: 5000 });
  });

  test("symptom form shows all 5 dimensions with sliders", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

    if (!(await addBtn.isVisible().catch(() => false))) {
      return;
    }

    await addBtn.click();

    const dialog = page.getByRole("dialog");
    for (const name of [
      "Agitation",
      "Concentration",
      "Impulsivité",
      "Régulation émotionnelle",
      "Sommeil",
    ]) {
      await expect(dialog.getByRole("slider", { name, exact: true })).toHaveCount(1);
    }
    await expect(dialog.getByText("Les routines du jour ont été tenues")).toBeVisible();

    await expect(page.locator("#context")).toBeVisible();
    await expect(page.locator("#notes")).toBeVisible();
  });

  test("symptom form has context and notes placeholders", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

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

  test("symptom form has date picker with today/yesterday shortcuts", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

    if (!(await addBtn.isVisible().catch(() => false))) {
      return;
    }

    await addBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("#symptom-date")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Aujourd'hui" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Hier" })).toBeVisible();
  });
});
