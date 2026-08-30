import { test, expect } from "@playwright/test";

// La base de connaissances est une force du produit au même titre que le
// programme Barkley : elle doit rester visible depuis le hub Suivi, et les
// suggestions du tableau de bord doivent ouvrir la version in-app
// (/connaissances) et non la page publique SEO (/ressources), qui affiche
// une barre marketing « Connexion / Commencer » à un parent déjà connecté.
test.describe("Accès à la base de connaissances", () => {
  test("le hub Suivi met en avant la base de connaissances", async ({ page }) => {
    await page.goto("/suivi");

    await expect(
      page.getByRole("heading", { name: "Comprendre le TDAH" }),
    ).toBeVisible();

    const link = page.getByRole("link", { name: /Base de connaissances/ });
    await expect(link).toBeVisible();

    await link.click();
    await page.waitForURL("**/connaissances");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("un article ouvert depuis l'app reste dans l'app", async ({ page }) => {
    await page.goto("/connaissances");

    await page.locator("a[href^='/connaissances/']").first().click();
    await page.waitForURL(/\/connaissances\/.+/);

    await expect(page.locator("h1")).toBeVisible();
    // On reste dans le cadre applicatif : la sidebar est là, et aucun lien
    // vers /login — les deux CTA « Connexion » et « Commencer » de la barre
    // marketing publique y pointent, c'est le marqueur fiable de cette barre
    // (viser le libellé « Connexion » matcherait aussi les articles sur la
    // « déconnexion émotionnelle »).
    await expect(page.locator('[data-slot="sidebar"]').first()).toBeVisible();
    await expect(page.locator('a[href="/login"]')).toHaveCount(0);
  });
});
