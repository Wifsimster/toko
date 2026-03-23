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

    await expect(page.locator("h1").first()).toContainText("Suivez le TDAH de votre enfant");
    await expect(page.getByRole("link", { name: "Commencer gratuitement" }).first()).toBeVisible();

    await context.close();
  });

  test("displays features section", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Suivi des symptômes").first()).toBeVisible();
    await expect(page.getByText("Gestion des médicaments").first()).toBeVisible();
    await expect(page.getByText("Journal de bord").first()).toBeVisible();
    await expect(page.getByText("Rendez-vous").first()).toBeVisible();

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
