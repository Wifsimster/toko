import { test, expect } from "@playwright/test";

test.describe("Account page", () => {
  test("displays account page with user info", async ({ page }) => {
    await page.goto("/account");

    await expect(page.locator("h1")).toContainText("Mon compte");
    await expect(page.getByText("Informations personnelles")).toBeVisible();
    await expect(
      page.locator("#main").getByText("demo@toko.app"),
    ).toBeVisible();
  });

  test("shows data export section (RGPD)", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByText(/Exporter mes donn[ée]es/i)).toBeVisible();
    await expect(page.getByText(/Droit [àa] la portabilit[ée]/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /T[ée]l[ée]charger/i })
    ).toBeVisible();
  });

  test("shows delete account section with confirmation", async ({ page }) => {
    await page.goto("/account");

    await expect(page.getByText(/Supprimer mon compte/i).first()).toBeVisible();
    await expect(page.getByText(/Droit [àa] l'effacement/i)).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Programmer la suppression/i })
    ).toBeVisible();

    await page.getByRole("button", { name: "Supprimer immédiatement" }).click();

    await expect(page.getByText(/Confirmer la suppression/i)).toBeVisible();
    await expect(page.locator("#delete-confirmation")).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Supprimer d[ée]finitivement/i })
    ).toBeDisabled();

    await page.locator("#delete-confirmation").fill("DELETE");
    await expect(
      page.getByRole("button", { name: /Supprimer d[ée]finitivement/i })
    ).toBeEnabled();

    await page.getByRole("button", { name: "Annuler" }).click();
  });
});
