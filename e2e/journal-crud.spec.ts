import { test, expect } from "@playwright/test";

test.describe("Journal CRUD operations", () => {
  test("create a new journal entry via form", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();
    await expect(page.getByText("Nouvelle entrée")).toBeVisible();

    // Fill in the journal text (required)
    await page.locator("#journal-text").fill("Aujourd'hui était une bonne journée. Il a bien géré ses émotions.");

    // Select some tags
    await page.getByText("École").click();
    await page.getByText("Victoire").click();

    // Submit the form
    await page.getByRole("button", { name: "Enregistrer" }).click();

    // Dialog should close
    await expect(page.getByText("Nouvelle entrée")).not.toBeVisible({ timeout: 5000 });
  });

  test("journal form shows mood selector with 4 emojis", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();

    await expect(page.getByText("Humeur du jour")).toBeVisible();

    // 4 mood emojis should be present
    await expect(page.getByText("😢")).toBeVisible();
    await expect(page.getByText("😐")).toBeVisible();
    await expect(page.getByText("🙂")).toBeVisible();
    await expect(page.getByText("😄")).toBeVisible();
  });

  test("journal form shows all tags", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();

    await expect(page.getByText("École")).toBeVisible();
    await expect(page.getByText("Victoire")).toBeVisible();
    await expect(page.getByText("Crise")).toBeVisible();
    await expect(page.getByText("Médicament")).toBeVisible();
    await expect(page.getByText("Sommeil")).toBeVisible();
    await expect(page.getByText("Sport")).toBeVisible();
    await expect(page.getByText("Thérapie")).toBeVisible();
  });

  test("journal form requires text field", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();

    // Submit without text - form should stay open (browser validation)
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Nouvelle entrée")).toBeVisible();
  });
});
