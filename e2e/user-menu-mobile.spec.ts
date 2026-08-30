import { test, expect } from "@playwright/test";

// Régression : sur mobile la sidebar est un panneau qui occupe 85 % de
// l'écran. Le menu utilisateur s'ouvrait « à droite » du bouton, donc hors
// écran : l'écran se figeait sans rien afficher. Le menu doit rester
// entièrement visible dans le viewport.
test.describe("Menu utilisateur (mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("le menu s'ouvre dans l'écran quand on touche son nom", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Plus d'options" }).click();

    const sidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]');
    await expect(sidebar).toBeVisible();

    await sidebar.getByRole("button", { name: "Menu utilisateur" }).click();

    const menu = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Mon compte" })).toBeVisible();

    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize()!;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  });

  test("« Mon compte » ferme le panneau et ouvre la page", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Plus d'options" }).click();
    const sidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]');
    await sidebar.getByRole("button", { name: "Menu utilisateur" }).click();

    await page
      .locator('[data-slot="dropdown-menu-content"]')
      .getByRole("menuitem", { name: "Mon compte" })
      .click();

    await page.waitForURL("**/account");
    await expect(sidebar).toBeHidden();
    await expect(page.locator("main h1")).toBeVisible();
  });
});
