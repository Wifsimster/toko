import { test, expect } from "@playwright/test";

test.describe("Account page", () => {
  test("displays account page with user info", async ({ page }) => {
    await page.goto("/account");

    await expect(page.locator("h1")).toContainText("Mon compte");
    await expect(page.getByText("Informations personnelles")).toBeVisible();
    await expect(page.getByText("demo@toko.app")).toBeVisible();
  });

  test("shows data export section (RGPD)", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByText("Exporter mes donnees")).toBeVisible();
    await expect(page.getByText("Droit a la portabilite")).toBeVisible();
    await expect(page.getByRole("button", { name: /Telecharger/ })).toBeVisible();
  });

  test("shows delete account section with confirmation", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByText("Supprimer mon compte").first()).toBeVisible();
    await expect(page.getByText("Droit a l'effacement")).toBeVisible();

    // Click delete button to open confirmation dialog
    await page.getByRole("button", { name: "Supprimer mon compte" }).click();

    await expect(page.getByText("Confirmer la suppression")).toBeVisible();
    await expect(page.locator("#delete-confirmation")).toBeVisible();

    // Delete button should be disabled without confirmation
    await expect(page.getByRole("button", { name: "Supprimer definitivement" })).toBeDisabled();

    // Type DELETE to enable
    await page.locator("#delete-confirmation").fill("DELETE");
    await expect(page.getByRole("button", { name: "Supprimer definitivement" })).toBeEnabled();

    // Close dialog without deleting
    await page.getByRole("button", { name: "Annuler" }).click();
  });
});
