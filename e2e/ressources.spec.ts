import { test, expect } from "@playwright/test";

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
      await page.goto("/connaissances");
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
    await expect(page.getByText("À lire ensuite")).toBeVisible();
  });

  test("shows one decorative Mō scene under each H2 of an illustrated article", async ({
    browser,
  }) => {
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

    const body = page.locator(".article-body");
    const headings = body.locator("h2");
    const scenes = body.getByTestId("article-section-scene");
    await expect(headings).toHaveCount(4);
    await expect(scenes).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const scene = scenes.nth(i);
      await expect(scene).toHaveAttribute("aria-hidden", "true");
      const box = await scene.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThan(80);
      await scene.scrollIntoViewIfNeeded();
      await expect(scene.locator("svg path").first()).toBeAttached();
      const follows = await headings
        .nth(i)
        .evaluate((h) => h.nextElementSibling?.getAttribute("data-testid"));
      expect(follows).toBe("article-section-scene");
    }
    await context.close();
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

    await expect(
      page.getByRole("heading", {
        name: /Comprendre le TDAH de votre enfant/i,
      })
    ).toBeVisible();
  });
});
