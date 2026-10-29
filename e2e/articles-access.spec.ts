import { test, expect } from "@playwright/test";

test.describe("Accès aux articles", () => {
  test("le hub Suivi met en avant les articles", async ({ page }) => {
    await page.goto("/suivi");

    await expect(
      page.getByRole("heading", { name: "Comprendre le TDAH" }),
    ).toBeVisible();

    const link = page.getByRole("link", { name: /^Articles/ });
    await expect(link).toBeVisible();

    await link.click();
    await page.waitForURL("**/connaissances");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("un article ouvert depuis l'app reste dans l'app", async ({ page }) => {
    await page.goto("/connaissances");

    await page.locator("a[href^='/connaissances/']").first().click();
    await page.waitForURL(/\/connaissances\/.+/);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[data-slot="sidebar"]').first()).toBeVisible();
    await expect(page.locator('a[href="/login"]')).toHaveCount(0);
  });

  test("les articles peuvent être triés par date ou par thème", async ({
    page,
  }) => {
    await page.goto("/connaissances");

    const recent = page.getByRole("tab", { name: "Les plus récents" });
    await expect(recent).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "Par thème" }).click();
    await expect(
      page.getByRole("heading", { name: "Connaissance TDAH", level: 2 }),
    ).toBeVisible();

    await recent.click();
    await expect(
      page.getByRole("heading", { name: "Connaissance TDAH", level: 2 }),
    ).toHaveCount(0);
  });
});
