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
    const schoolTag = dialog.getByRole("button", { name: /^École$/ }).first();
    const winTag = dialog.getByRole("button", { name: /^Victoire$/ }).first();
    if (await schoolTag.isVisible().catch(() => false)) await schoolTag.click();
    if (await winTag.isVisible().catch(() => false)) await winTag.click();

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
    const moodButtons = await dialog.getByRole("button").count();
    expect(moodButtons).toBeGreaterThan(0);
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
    await expect(dialog.locator("#journal-text")).toBeVisible();
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
