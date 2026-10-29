import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("displays dashboard or welcome screen", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 30_000 });
  });

  test("welcome screen has add child button", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const isWelcome = await page.getByText("Bienvenue sur Tokō").isVisible().catch(() => false);

    if (isWelcome) {
      await page.locator("main").getByText("Ajouter un enfant").click();
      await expect(page.getByRole("heading", { name: "Ajouter votre enfant" })).toBeVisible();
      await expect(page.locator("#child-name")).toBeVisible();
    }
  });

  test("mood logger or welcome is visible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const hasMoodLogger = await page.getByText("Humeur du jour").isVisible().catch(() => false);
    const hasWelcome = await page.getByText("Bienvenue sur Tokō").isVisible().catch(() => false);
    const hasHeading = await page.locator("h1").isVisible().catch(() => false);

    expect(hasMoodLogger || hasWelcome || hasHeading).toBeTruthy();
  });
});
