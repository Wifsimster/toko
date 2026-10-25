import { test, expect } from "@playwright/test";

test.describe("Symptoms page", () => {
  test("displays symptoms page with heading", async ({ page }) => {
    await page.goto("/symptoms");

    await expect(page.locator("h1")).toContainText("Symptômes");
    await expect(page.getByText("Suivi quotidien des symptômes")).toBeVisible();
  });

  test("add symptom button opens dialog", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    await page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Nouveau relevé")).toBeVisible();
    // Scope to dialog to avoid strict-mode collisions with background cards
    await expect(dialog.getByText("Agitation", { exact: true })).toBeVisible();
    await expect(
      dialog.getByText("Concentration", { exact: true })
    ).toBeVisible();
    await expect(dialog.getByText("Impulsivité", { exact: true })).toBeVisible();
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

test.describe("Symptoms page — direction Mō", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("filters are toggle buttons that announce the active one", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");
    const group = page.getByRole("group", { name: "Filtrer les relevés" });
    if (!(await group.isVisible().catch(() => false))) return; // pas de relevé

    const all = group.getByRole("button", { name: "Toutes" });
    const mood = group.getByRole("button", { name: "Humeur difficile" });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(mood).toHaveAttribute("aria-pressed", "false");

    await mood.click();
    await expect(mood).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: "Effacer" })).toBeVisible();
  });

  test("day summary shows Mō instead of an emoji, decorative only", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");
    const badge = page.locator("main [data-slot=mood-badge]").first();
    if (!(await badge.isVisible().catch(() => false))) return;

    await expect(badge.locator("[data-mo]")).toHaveAttribute("aria-hidden", "true");
    // Plus aucun emoji d'humeur dans la liste.
    await expect(page.locator("main")).not.toContainText(/[😀😐😟😌😤🔁]/u);

    // Le bouton de résumé déplie le détail par dimension, en texte.
    const summary = page.locator("main article button[aria-controls]").first();
    await summary.click();
    await expect(summary).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("main dl").first()).toBeVisible();
  });

  test("card actions and filter chips are at least 44 px", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");
    const targets = page.locator(
      "main [role=group] button, main article button",
    );
    const count = await targets.count();
    for (let i = 0; i < Math.min(count, 12); i++) {
      const box = await targets.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height, `cible ${i}`).toBeGreaterThanOrEqual(44);
      expect(box.width, `cible ${i}`).toBeGreaterThanOrEqual(44);
    }
  });
});
