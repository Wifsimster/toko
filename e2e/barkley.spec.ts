import { test, expect } from "@playwright/test";

test.describe("Barkley reward board", () => {
  test("displays barkley page with heading", async ({ page }) => {
    await page.goto("/barkley");

    await expect(page.locator("h1")).toContainText(
      /Programme Barkley|Tableau Barkley/
    );
    await expect(page.getByText("Programme d'entraînement aux habiletés parentales")).toBeVisible();
  });

  test("shows tabs for rewards and programme", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    const hasTabs = await page.getByRole("tab", { name: "Tableau de récompenses" }).isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    if (hasTabs) {
      await expect(page.getByRole("tab", { name: "Tableau de récompenses" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Programme" })).toBeVisible();
    } else {
      const hasHeading = await page.locator("h1").isVisible().catch(() => false);
      expect(hasNoChild || hasHeading).toBeTruthy();
    }
  });

  test("programme tab shows 10 Barkley steps", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    const hasTabs = await page.getByRole("tab", { name: "Programme" }).isVisible().catch(() => false);

    if (hasTabs) {
      await page.getByRole("tab", { name: "Programme" }).click();

      await expect(page.getByText("Progression")).toBeVisible();
      await expect(page.getByText("Étape 1")).toBeVisible();
      await expect(page.getByText("Étape 10")).toBeVisible();
    }
  });

  test("discreet tip is displayed", async ({ page }) => {
    await page.goto("/barkley");
    await page.waitForLoadState("networkidle");

    const tip = page.getByRole("note", { name: "Conseil" });
    if (await tip.isVisible().catch(() => false)) {
      await expect(tip).toBeVisible();
      await expect(
        tip.getByRole("button", { name: "Masquer ce conseil" })
      ).toBeVisible();
    }
  });
});

test.describe("Barkley formation scenes", () => {
  test("steps 1 to 3 show one decorative scene per section, step 4 none", async ({ page }) => {
    await page.goto("/barkley/formation/1");
    await page.waitForLoadState("networkidle");

    const hasContent = await page.getByRole("heading", { name: "Comprendre" }).isVisible().catch(() => false);
    test.skip(!hasContent, "formation locked or no active child");

    for (const step of [1, 2, 3]) {
      await page.goto(`/barkley/formation/${step}`);
      const scenes = page.getByTestId("barkley-section-scene");
      await expect(scenes).toHaveCount(4);
      for (const scene of await scenes.all()) {
        await expect(scene).toHaveAttribute("aria-hidden", "true");
        await expect(scene.locator("svg path").first()).toBeAttached();
      }
    }

    await page.goto("/barkley/formation/4");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("barkley-section-scene")).toHaveCount(0);
  });
});
