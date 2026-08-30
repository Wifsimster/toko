import { test, expect, type Page } from "@playwright/test";

// Scroll down to the bottom of the document and return the resulting offset.
// Returns 0 when the page is not scrollable, which the tests assert against so
// a layout change that makes a page short can never silently void them.
async function scrollToBottom(page: Page) {
  const offset = await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    return window.scrollY;
  });
  // TanStack Router records scroll offsets from a scroll listener throttled at
  // 100ms. Navigating inside that window makes it file the offset under the
  // *next* history entry, which then reads as a position to restore. A human
  // never scrolls and taps in the same 100ms; the test must not either.
  await page.waitForTimeout(300);
  return offset;
}

// The dashboard grows as its queries resolve. Measuring the scroll height
// before that settles makes the assertions compare two different layouts.
async function openDashboard(page: Page) {
  await page.goto("/dashboard");
  await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("a[href='/barkley']").first()).toBeVisible();
  await page.waitForLoadState("networkidle");
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

// Regression guard: the router used to be created without `scrollRestoration`,
// so TanStack Router never touched the scroll offset. Landing halfway down a
// fresh page is exactly the kind of surprise CLAUDE.md rules out — the page has
// to start where the user expects it to.
test.describe("Restauration du scroll", () => {
  test("une nouvelle page s'ouvre en haut", async ({ page }) => {
    await openDashboard(page);

    const offset = await scrollToBottom(page);
    expect(offset).toBeGreaterThan(0);

    // `/barkley` is a primary nav item, so the link is on screen both in the
    // desktop sidebar and in the mobile tab bar.
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

    // Tolerance: the dashboard is re-rendered from the React Query cache, so
    // its height can differ by a few pixels from the first visit.
    await expect
      .poll(() => scrollY(page), { timeout: 10_000 })
      .toBeGreaterThan(before - 100);
  });
});
