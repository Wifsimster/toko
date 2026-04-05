import { test, expect } from "@playwright/test";

// Landing page tests need a fresh unauthenticated browser context
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Landing page", () => {
  test("displays hero section with CTA", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");

    // Wait for SPA to render (redirect may happen if session exists)
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1").first()).toContainText("Comprendre le TDAH");
    await expect(page.getByRole("link", { name: "Commencer gratuitement" }).first()).toBeVisible();

    await context.close();
  });

  test("displays features section", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Liste de crise plein écran").first()).toBeVisible();
    await expect(page.getByText("Programme Barkley (PEHP)").first()).toBeVisible();
    await expect(page.getByText("Journal du quotidien").first()).toBeVisible();
    await expect(page.getByText("Suivi sur 7 dimensions").first()).toBeVisible();

    await context.close();
  });

  test("displays pricing section", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("0€").first()).toBeVisible();
    await expect(page.getByText("4,99€").first()).toBeVisible();

    await context.close();
  });

  test("nav links to login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Connexion" }).click();
    await page.waitForURL("**/login");

    await expect(page.locator("h1")).toContainText("Toko");

    await context.close();
  });

  test("displays trust bar", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Fondé sur le programme Barkley")).toBeVisible();
    await expect(page.getByText(/RGPD.*données hébergées en UE/)).toBeVisible();

    await context.close();
  });

  test("displays testimonials", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Ce qu'en disent les parents")).toBeVisible();
    await expect(page.getByText(/Sophie, maman de Léo/)).toBeVisible();

    await context.close();
  });

  test("displays pricing comparison table with 14j badge", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("14 jours offerts · sans CB").first()).toBeVisible();
    await expect(page.getByText("Comparatif détaillé")).toBeVisible();
    await expect(page.getByText("Export PDF pour le médecin").first()).toBeVisible();

    await context.close();
  });

  test("resources link navigates to /ressources", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Explorer les ressources" }).click();
    await page.waitForURL("**/ressources");

    await expect(page.locator("h1")).toContainText("Comprendre le TDAH");

    await context.close();
  });

  test("footer links work", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Mentions légales" }).click();
    await page.waitForURL("**/mentions-legales");

    await page.goBack();
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Confidentialité" }).click();
    await page.waitForURL("**/confidentialite");

    await page.goBack();
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Contact" }).click();
    await page.waitForURL("**/contact");

    await context.close();
  });
});
