import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar navigation works for all pages", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Sidebar links (visible on desktop)
    const navLinks = ["/symptoms", "/journal", "/barkley", "/account"];
    const sidebar = page.locator('[data-slot="sidebar"]').first();

    for (const url of navLinks) {
      const link = sidebar.locator(`a[href='${url}']`).first();
      if (!(await link.isVisible().catch(() => false))) continue;
      await link.click();
      await page.waitForURL(`**${url}`);
      await expect(page.locator("main h1")).toBeVisible();
    }

    // Navigate back to dashboard - heading depends on whether children exist
    await sidebar.locator("a[href='/dashboard']").first().click();
    await page.waitForURL("**/dashboard");
    await expect(
      page
        .getByRole("heading", { name: "Tableau de bord" })
        .or(page.getByRole("heading", { name: "Bienvenue sur Tokō" }))
    ).toBeVisible({ timeout: 10_000 });
  });

  test("sidebar shows app name", async ({ page }) => {
    await page.goto("/dashboard");

    const sidebar = page.locator('[data-slot="sidebar"]').first();
    await expect(sidebar.getByText("Toko", { exact: true })).toBeVisible();
  });

  test("unauthenticated user is redirected to login", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto("/dashboard");

    await page.waitForURL("**/login", { timeout: 10_000 });
    await expect(page.locator("h1")).toContainText("Toko");

    await context.close();
  });

  test("logo links back to dashboard", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForURL("**/symptoms");

    const sidebar = page.locator('[data-slot="sidebar"]').first();
    await sidebar.getByRole("link").filter({ hasText: "Toko" }).first().click();
    await page.waitForURL("**/dashboard");
  });
});
