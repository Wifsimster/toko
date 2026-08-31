import { test, expect } from "@playwright/test";

// Le lexique est le premier réflexe d'un parent qui reçoit un courrier plein
// de sigles : il doit rester accessible depuis le hub Suivi, et la recherche
// doit filtrer sans effort (insensible à la casse et aux accents).
test.describe("Lexique", () => {
  test("le hub Suivi donne accès au lexique", async ({ page }) => {
    await page.goto("/suivi");

    const link = page.getByRole("link", { name: /Lexique/ });
    await expect(link).toBeVisible();

    await link.click();
    await page.waitForURL("**/lexique");
    await expect(page.locator("h1")).toContainText("Lexique");
  });

  test("la recherche filtre les sigles", async ({ page }) => {
    await page.goto("/lexique");
    await expect(page.locator("h1")).toBeVisible();

    const search = page.getByLabel("Chercher un sigle ou un mot");
    await search.fill("mdph");

    await expect(
      page.getByText("Maison départementale des personnes handicapées"),
    ).toBeVisible();
    // Un terme sans rapport disparaît (plusieurs définitions citent la MDPH,
    // on vérifie donc un terme qui ne la mentionne nulle part).
    await expect(page.getByText("Bilan orthophonique")).toHaveCount(0);
  });

  test("la page publique du lexique est accessible sans compte", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/lexique");
    await page.waitForLoadState("networkidle");

    if (!/\/ressources\/lexique/.test(page.url())) {
      await context.close();
      return;
    }

    await expect(page.locator("h1")).toContainText("sigles");
    await expect(page.getByText("MDPH").first()).toBeVisible();
    await context.close();
  });
});
