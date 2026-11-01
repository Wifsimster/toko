import { test, expect } from "@playwright/test";

const GROUPS = ["Au quotidien", "Outils", "Comprendre", "En cas de besoin", "Compte", "Communauté"];

test.describe("Plus (mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("l'onglet Plus ouvre la page qui liste tout, en groupes", async ({ page }) => {
    await page.goto("/dashboard");

    const tabBar = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(tabBar.getByRole("link")).toHaveText(["Accueil", "Suivi", "Barkley", "Compte", "Plus"]);

    await tabBar.getByRole("link", { name: "Plus" }).click();
    await page.waitForURL("**/plus");
    await expect(page.locator("main h1")).toHaveText("Plus");
    await expect(tabBar.getByRole("link", { name: "Plus" })).toHaveAttribute("aria-current", "page");

    for (const name of GROUPS) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /^Rapport/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Retrouvez-nous sur Discord/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Se déconnecter" })).toBeVisible();
  });

  test("« Mon compte » ouvre la page du compte", async ({ page }) => {
    await page.goto("/plus");

    await page.getByRole("link", { name: /^Mon compte Rappels/ }).click();

    await page.waitForURL("**/account");
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("l'onglet Suivi ouvre le journal", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Suivi" }).click();

    await page.waitForURL("**/journal");
    await expect(page.locator("main h1")).toHaveText("Journal");
  });
});

test.describe("Plus (bureau)", () => {
  test("la barre latérale garde Accueil, Suivi, Barkley, Compte et Plus", async ({ page, isMobile }) => {
    test.skip(isMobile, "barre latérale visible sur grand écran uniquement");
    await page.goto("/dashboard");

    const sidebar = page.locator('[data-slot="sidebar"]').first();
    await expect(sidebar.locator("a[href='/journal']")).toBeVisible();

    await sidebar.locator("a[href='/plus']").click();
    await page.waitForURL("**/plus");
    await expect(page.locator("main h1")).toHaveText("Plus");
  });

  test("l'ancienne adresse /suivi mène au journal", async ({ page }) => {
    await page.goto("/suivi");

    await page.waitForURL("**/journal");
    await expect(page.locator("main h1")).toHaveText("Journal");
  });
});
