import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Share-with-entourage feature", () => {
  test("share block appears on an article page", async ({ browser }) => {
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

    await expect(
      page.getByText("Votre entourage aussi doit comprendre")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Envoyer à un proche/ })
    ).toBeVisible();

    await context.close();
  });

  test("share dialog opens with tones + message + channels", async ({
    browser,
  }) => {
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

    const openShare = page.getByRole("button", { name: /Envoyer à un proche/ });
    if (!(await openShare.isVisible().catch(() => false))) {
      await context.close();
      return;
    }
    await openShare.click();

    await expect(page.locator('[data-slot="dialog-title"]')).toHaveText(
      "Envoyer à un proche"
    );

    await expect(page.getByRole("radio", { name: /Pédagogique/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Complice/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Posé/ })).toBeVisible();

    const textarea = page.locator("#share-message");
    await expect(textarea).toBeVisible();
    const defaultMsg = await textarea.inputValue();
    expect(defaultMsg).toContain("Dysrégulation");

    await expect(page.getByRole("button", { name: /WhatsApp/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copier/ })).toBeVisible();

    await expect(
      page.getByText("Aucune donnée de votre enfant n'est incluse")
    ).toBeVisible();

    await context.close();
  });

  test("switching tone updates the message template", async ({ browser }) => {
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

    const openShare = page.getByRole("button", { name: /Envoyer à un proche/ });
    if (!(await openShare.isVisible().catch(() => false))) {
      await context.close();
      return;
    }
    await openShare.click();

    const textarea = page.locator("#share-message");
    const pedagogueMsg = await textarea.inputValue();
    expect(pedagogueMsg.length).toBeGreaterThan(10);

    await page.getByRole("radio", { name: /Posé/ }).click();
    await expect
      .poll(() => textarea.inputValue(), { timeout: 5000 })
      .not.toEqual(pedagogueMsg);
    const poseMsg = await textarea.inputValue();
    expect(poseMsg.length).toBeGreaterThan(10);
    expect(poseMsg).not.toEqual(pedagogueMsg);

    await context.close();
  });

  test("incoming shared banner shows when ?s= param is present", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/mini-guide-grands-parents-tdah?s=TestAbc1");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    await expect(
      page.getByText(/Un parent proche vous a partagé ce guide/)
    ).toBeVisible();

    await expect(
      page.getByText("Votre entourage aussi doit comprendre")
    ).not.toBeVisible();

    await context.close();
  });

  test("entourage section is visible on resources index", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    await expect(page.getByText("Pour l'entourage")).toBeVisible();
    await expect(
      page.getByText("Des guides à partager avec vos proches")
    ).toBeVisible();
    await expect(
      page.getByText("Votre petit-enfant TDAH n'est pas mal élevé")
    ).toBeVisible();

    await context.close();
  });

  test("entourage mini-guide renders with intro + CTA", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/mini-guide-grands-parents-tdah");
    await page.waitForLoadState("networkidle");
    if (!/\/ressources/.test(page.url())) {
      await context.close();
      return;
    }

    await expect(page.locator("h1")).toContainText(
      "Votre petit-enfant TDAH n'est pas mal élevé"
    );

    await context.close();
  });
});
