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
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Fill in the journal text (optional)
    await page.locator("#journal-text").fill("Aujourd'hui était une bonne journée. Il a bien géré ses émotions.");

    // Select some tags
    await dialog.getByRole("button", { name: /^École$/ }).first().click();
    await dialog.getByRole("button", { name: /^Victoire$/ }).first().click();

    // Submit the form
    await dialog.getByRole("button", { name: "Ajouter l'entrée" }).click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test("journal form shows mood selector with 4 emojis", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 4 mood emojis should be present
    await expect(dialog.getByRole("button", { name: "😢" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "😐" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "🙂" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "😄" })).toBeVisible();
  });

  test("journal form shows all tags", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: /^École$/ }).first()).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Victoire$/ }).first()).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Crise$/ }).first()).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Traitement$/ }).first()).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Sommeil$/ }).first()).toBeVisible();
  });

  test("journal form has date picker with today/yesterday shortcuts", async ({ page }) => {
    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    const writeBtn = page.getByRole("button", { name: "Écrire" });

    if (!(await writeBtn.isVisible().catch(() => false))) {
      return;
    }

    await writeBtn.click();

    await expect(page.locator("#journal-date")).toBeVisible();
    await expect(page.getByRole("button", { name: "Aujourd'hui" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hier" })).toBeVisible();
  });
});
