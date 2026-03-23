import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("displays dashboard or welcome screen", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for either the dashboard heading or welcome heading to appear
    await expect(
      page.getByText("Tableau de bord").or(page.getByText("Bienvenue sur Tokō"))
    ).toBeVisible({ timeout: 10_000 });
  });

  test("welcome screen has add child button", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const isWelcome = await page.getByText("Bienvenue sur Tokō").isVisible().catch(() => false);

    if (isWelcome) {
      // Click the "Ajouter un enfant" button inside the main content area
      await page.locator("main").getByText("Ajouter un enfant").click();
      await expect(page.getByRole("heading", { name: "Ajouter votre enfant" })).toBeVisible();
      await expect(page.locator("#child-name")).toBeVisible();
      await expect(page.locator("#child-birth")).toBeVisible();
    }
  });

  test("mood logger or welcome is visible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const hasMoodLogger = await page.getByText("Humeur du jour").isVisible().catch(() => false);
    const hasWelcome = await page.getByText("Bienvenue sur Tokō").isVisible().catch(() => false);

    expect(hasMoodLogger || hasWelcome).toBeTruthy();
  });
});
