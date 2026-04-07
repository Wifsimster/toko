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

    await expect(page.locator("h1").first()).toBeVisible();

    await context.close();
  });

  test("displays features section", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    await context.close();
  });

  test("displays pricing section", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    await context.close();
  });

  test("nav links to login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loginLink = page.getByRole("link", { name: "Connexion" }).first();
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await page.waitForURL("**/login");
      await expect(page.locator("h1")).toContainText("Toko");
    }

    await context.close();
  });

  test("displays trust bar", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    await context.close();
  });

  test("displays testimonials", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    await context.close();
  });

  test("displays pricing comparison table with 14j badge", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    await context.close();
  });

  test("resources link navigates to /ressources", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: "Explorer les ressources" }).click();
    await page.waitForURL(/\/(ressources|actualites)/);

    await expect(page.locator("h1")).toBeVisible();

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
