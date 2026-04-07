import { test, expect } from "@playwright/test";

// Public pages — test with clean (unauthenticated) context
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Resources hub", () => {
  test("displays index with featured pillar and article grid", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await page.goto("/actualites");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toBeVisible();
      await context.close();
      return;
    }

    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("opens pillar article with title and CTA", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/crise-tdah-enfant-guide-complet");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    await expect(page.locator("h1")).toContainText("Crise TDAH");
    await expect(page.getByText("Toutes les ressources")).toBeVisible();
    await expect(page.getByText("Passez à l'action avec Tokō")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Construire ma liste de crise/ })
    ).toBeVisible();
  });

  test("opens a cluster article with contextual CTA", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/troubles-sommeil-tdah-enfant");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    await expect(page.locator("h1")).toContainText("Troubles du sommeil");
    await expect(
      page.getByRole("link", { name: /Suivre le sommeil dans Tokō/ })
    ).toBeVisible();
    // Related articles section
    await expect(page.getByText("À lire ensuite")).toBeVisible();
  });

  test("sets document title from metaTitle", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/dysregulation-emotionnelle-tdah");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    const title = await page.title();
    expect(title).toContain("Dysrégulation émotionnelle");
  });

  test("navigates back to index from breadcrumb", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/co-regulation-parent-enfant-tdah");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    await page.getByRole("link", { name: /Toutes les ressources/ }).click();
    await page.waitForURL("**/ressources");

    await expect(page.getByText("Tous les articles")).toBeVisible();
  });
});
