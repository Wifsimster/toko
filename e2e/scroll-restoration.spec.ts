import { test, expect, type Page } from "@playwright/test";

async function scrollToBottom(page: Page) {
  const offset = await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    return window.scrollY;
  });
  await page.waitForTimeout(300);
  return offset;
}

async function openDashboard(page: Page) {
  await page.goto("/dashboard");
  await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("a[href='/barkley']").first()).toBeVisible();
  await page.waitForLoadState("networkidle");
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

test.describe("Restauration du scroll", () => {
  test("une nouvelle page s'ouvre en haut", async ({ page }) => {
    await openDashboard(page);

    const offset = await scrollToBottom(page);
    expect(offset).toBeGreaterThan(0);

    await page.locator("a[href='/barkley']").first().click();
    await page.waitForURL("**/barkley");
    await expect(page.locator("main h1")).toBeVisible();

    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("le retour navigateur restaure la position précédente", async ({
    page,
  }) => {
    await openDashboard(page);

    const before = await scrollToBottom(page);
    expect(before).toBeGreaterThan(0);

    await page.locator("a[href='/barkley']").first().click();
    await page.waitForURL("**/barkley");
    await expect(page.locator("main h1")).toBeVisible();

    await page.goBack();
    await page.waitForURL("**/dashboard");

    await expect
      .poll(() => scrollY(page), { timeout: 10_000 })
      .toBeGreaterThan(before - 100);
  });
});
