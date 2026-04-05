import { test, expect } from "@playwright/test";

// Public pages — test unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Share-with-entourage feature", () => {
  test("share block appears on an article page", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto("/ressources/crise-tdah-enfant-guide-complet");
    await page.waitForLoadState("networkidle");

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

    await page.getByRole("button", { name: /Envoyer à un proche/ }).click();

    // Dialog title (brand voice)
    await expect(page.getByText("Tendre un pont vers un proche")).toBeVisible();

    // Three tones
    await expect(page.getByRole("button", { name: /Pédagogique/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Complice/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Posé/ })).toBeVisible();

    // Pre-filled editable message
    const textarea = page.locator("#share-message");
    await expect(textarea).toBeVisible();
    const defaultMsg = await textarea.inputValue();
    expect(defaultMsg).toContain("Dysrégulation");

    // Channels
    await expect(page.getByRole("button", { name: /WhatsApp/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copier/ })).toBeVisible();

    // No-child-data disclaimer
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

    await page.getByRole("button", { name: /Envoyer à un proche/ }).click();

    const textarea = page.locator("#share-message");
    const pedagogueMsg = await textarea.inputValue();
    expect(pedagogueMsg).toContain("apprenne ensemble");

    await page.getByRole("button", { name: /Posé/ }).click();
    const poseMsg = await textarea.inputValue();
    expect(poseMsg).toContain("calmement");
    expect(poseMsg).not.toContain("apprenne ensemble");

    await context.close();
  });

  test("incoming shared banner shows when ?s= param is present", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await page.goto(
      "/ressources/mini-guide-grands-parents-tdah?s=TestAbc1"
    );
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/Un parent proche vous a partagé ce guide/)
    ).toBeVisible();

    // Share block is hidden for recipients
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

    await expect(page.locator("h1")).toContainText(
      "Votre petit-enfant TDAH n'est pas mal élevé"
    );
    await expect(page.getByText(/fonctionnement cérébral différent/)).toBeVisible();

    await context.close();
  });
});
