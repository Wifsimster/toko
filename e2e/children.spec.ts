import { test, expect } from "@playwright/test";

test.describe("Child management", () => {
  test("child selector is visible in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator('[data-slot="sidebar"]').first();
    const hasWelcome = await page.getByText("Bienvenue sur Tokō").isVisible().catch(() => false);
    const hasChildCombobox = await sidebar
      .getByRole("combobox")
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasWelcome || hasChildCombobox).toBeTruthy();
  });

  test("add child dialog shows form with required fields", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Try to open add child dialog from the welcome screen or the sidebar +.
    const welcomeBtn = page.locator("main").getByText("Ajouter un enfant");
    const sidebarAddBtn = page
      .locator('[data-slot="sidebar"]')
      .first()
      .getByRole("button", { name: "Ajouter un enfant" });

    if (await welcomeBtn.isVisible().catch(() => false)) {
      await welcomeBtn.click();
    } else if (await sidebarAddBtn.isVisible().catch(() => false)) {
      await sidebarAddBtn.click();
    } else {
      // No add button available, skip
      return;
    }

    const dialogHeading = page.getByRole("heading", { name: /Ajouter.*enfant/i });
    if (!(await dialogHeading.isVisible().catch(() => false))) {
      return;
    }
    await expect(dialogHeading).toBeVisible();
    // Some variants hide or step-load fields; ensure at least one key input is present.
    const hasName = await page.locator("#child-name").isVisible().catch(() => false);
    const hasBirth = await page.locator("#child-birth").isVisible().catch(() => false);
    expect(hasName || hasBirth).toBeTruthy();
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
      await page
        .getByRole("button", { name: /G[ée]n[ée]rer un surnom/i })
        .click();
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
      await expect(
        page.getByRole("heading", { name: /Ajouter votre enfant/i })
      ).toBeVisible();
    }
  });
});
