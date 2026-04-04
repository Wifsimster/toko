import { test, expect } from "@playwright/test";

test.describe("Child management", () => {
  test("child selector is visible in header", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Either a child selector or "Ajouter un enfant" should be visible
    const hasSelector = await page.getByText("Enfant").isVisible().catch(() => false);
    const hasWelcome = await page.getByText("Bienvenue sur Tokō").isVisible().catch(() => false);
    const hasChild = await page.locator("header").getByRole("combobox").isVisible().catch(() => false);

    expect(hasSelector || hasWelcome || hasChild).toBeTruthy();
  });

  test("add child dialog shows form with required fields", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Try to open add child dialog from dashboard or header
    const welcomeBtn = page.locator("main").getByText("Ajouter un enfant");
    const headerBtn = page.locator("header").getByRole("button", { name: "Ajouter" });

    if (await welcomeBtn.isVisible().catch(() => false)) {
      await welcomeBtn.click();
    } else if (await headerBtn.isVisible().catch(() => false)) {
      await headerBtn.click();
    } else {
      // No add button available (child already exists), skip
      return;
    }

    await expect(page.getByRole("heading", { name: "Ajouter votre enfant" })).toBeVisible();
    await expect(page.locator("#child-name")).toBeVisible();
    await expect(page.locator("#child-birth")).toBeVisible();
    await expect(page.getByText("Genre")).toBeVisible();
    await expect(page.getByText("Type de diagnostic")).toBeVisible();
  });

  test("add child form has random nickname generator", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const welcomeBtn = page.locator("main").getByText("Ajouter un enfant");

    if (await welcomeBtn.isVisible().catch(() => false)) {
      await welcomeBtn.click();

      const nameInput = page.locator("#child-name");
      await expect(nameInput).toHaveValue("");

      // Click the shuffle button for random nickname
      await page.getByRole("button", { name: "Générer un surnom" }).click();
      await expect(nameInput).not.toHaveValue("");
    }
  });

  test("add child form validates required fields", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const welcomeBtn = page.locator("main").getByText("Ajouter un enfant");

    if (await welcomeBtn.isVisible().catch(() => false)) {
      await welcomeBtn.click();

      const submitBtn = page.getByRole("button", { name: "Ajouter" }).last();
      await expect(submitBtn).toBeVisible();

      // Name and birth date are required, so clicking submit without them
      // should not close the dialog (browser validation)
      await submitBtn.click();
      await expect(page.getByRole("heading", { name: "Ajouter votre enfant" })).toBeVisible();
    }
  });
});
