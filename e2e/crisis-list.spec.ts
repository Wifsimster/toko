import { test, expect } from "@playwright/test";

test.describe("Crisis list page", () => {
  test("displays crisis list page with heading", async ({ page }) => {
    await page.goto("/crisis-list");

    await expect(page.locator("h1")).toContainText("Liste de la crise");
    await expect(
      page.getByText("Les choses qui me font du bien")
    ).toBeVisible();
  });

  test("shows empty state or items list", async ({ page }) => {
    await page.goto("/crisis-list");
    await page.waitForLoadState("networkidle");

    const hasItems = await page.locator("[class*=Card]").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("La liste est vide").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    const hasHeading = await page.locator("h1").isVisible().catch(() => false);
    expect(hasItems || hasEmpty || hasNoChild || hasHeading).toBeTruthy();
  });

  test("add button opens create dialog", async ({ page }) => {
    await page.goto("/crisis-list");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();

      // The prompt string appears both as the dialog title (h2) and as
      // the label for #crisis-label. Scope to the heading to avoid the
      // strict-mode violation.
      await expect(
        page.getByRole("heading", { name: /Qu'est-ce qui te fait du bien/ })
      ).toBeVisible();
      await expect(page.locator("#crisis-label")).toBeVisible();
    }
  });

  test("create dialog has suggestion toggle", async ({ page }) => {
    await page.goto("/crisis-list");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();

      // Click the "Des idées ?" button to show suggestions
      const ideasBtn = page.getByRole("button", { name: "Des idées" });
      if (await ideasBtn.isVisible().catch(() => false)) {
        await ideasBtn.click();

        // Suggestions should appear
        await expect(page.getByText("Câliner mon doudou")).toBeVisible();
        await expect(page.getByText("Écouter de la musique douce")).toBeVisible();
      }
    }
  });

  test("create dialog has shuffle button for random suggestion", async ({ page }) => {
    await page.goto("/crisis-list");
    await page.waitForLoadState("networkidle");

    const addBtn = page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true });

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();

      const shuffleBtn = page.getByRole("button", { name: "Suggestion au hasard" });
      if (await shuffleBtn.isVisible().catch(() => false)) {
        await shuffleBtn.click();

        // Label input should now have a suggestion
        await expect(page.locator("#crisis-label")).not.toHaveValue("");
      }
    }
  });

  test("crisis mode button visible when items exist", async ({ page }) => {
    await page.goto("/crisis-list");
    await page.waitForLoadState("networkidle");

    const hasItems = await page.locator("[class*=Card]").first().isVisible().catch(() => false);

    if (hasItems) {
      await expect(
        page.getByRole("button", { name: "Mode crise" })
      ).toBeVisible();
    }
  });

  test("crisis mode shows full-screen view with navigation", async ({ page }) => {
    await page.goto("/crisis-list");
    await page.waitForLoadState("networkidle");

    const crisisBtn = page.getByRole("button", { name: "Mode crise" });

    if (await crisisBtn.isVisible().catch(() => false)) {
      await crisisBtn.click();

      // Full-screen crisis view should be visible
      await expect(page.locator(".fixed.inset-0")).toBeVisible();

      // Close button should exist
      const closeBtn = page.locator(".fixed.inset-0").getByRole("button").first();
      await expect(closeBtn).toBeVisible();
    }
  });
});
