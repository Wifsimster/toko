import { test, expect, type Locator, type Page } from "@playwright/test";

async function openFreshOnboarding(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("e2e-onboarding-reset")) return;
    sessionStorage.setItem("e2e-onboarding-reset", "1");
    const raw = localStorage.getItem("toko-ui");
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state = { ...(parsed.state ?? {}), onboardingCompleted: false, onboardingGoal: null };
    localStorage.setItem("toko-ui", JSON.stringify(parsed));
  });
  await page.goto("/dashboard");
  const dialog = page.getByTestId("onboarding");
  await expect(dialog).toBeVisible({ timeout: 30_000 });
  return dialog;
}

const uiState = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("toko-ui") ?? "{}").state);

function countMoodPosts(page: Page) {
  const posts: unknown[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/parent-mood") && r.method() === "POST") posts.push(r.postDataJSON());
  });
  return posts;
}

async function expectCatalogue(dialog: Locator) {
  await expect(dialog.getByRole("heading", { level: 1, name: /Ce qui est gratuit/ })).toBeFocused();
  await expect(dialog.getByRole("heading", { level: 2, name: "Gratuit" })).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2, name: "Famille" })).toBeVisible();
  await expect(dialog.getByText(/€/).first()).toBeVisible();
  await expect(dialog.getByRole("button", { name: /essayer|payer|abonn|passer/i })).toHaveCount(0);
  await expect(dialog.locator("[data-mo]")).toHaveCount(0);
  await expect(
    dialog.getByRole("list", { name: "Progression" }).locator('[aria-current="step"]')
  ).toHaveText("Étape 5 sur 6");
}

test.describe("Onboarding Mō", () => {
  test("parcours complet : humeur, objectif, catalogue, retour à l'accueil", async ({ page }) => {
    const posts = countMoodPosts(page);
    const dialog = await openFreshOnboarding(page);

    await expect(dialog.getByRole("heading", { level: 1, name: "Tokō" })).toBeFocused();
    await dialog.getByRole("button", { name: "Commencer" }).click();

    const progress = dialog.getByRole("list", { name: "Progression" });
    await expect(progress.getByRole("listitem")).toHaveCount(6);
    await expect(progress.locator('[aria-current="step"]')).toHaveText("Étape 1 sur 6");
    await expect(dialog.getByRole("heading", { level: 1 })).toBeFocused();

    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByRole("button", { name: "Retour" })).toBeVisible();
    await dialog.locator("label", { hasText: "Calme" }).click();
    await expect(dialog.getByRole("radio", { name: "Calme" })).toBeChecked();
    await dialog.getByRole("button", { name: "Suivant" }).click();

    await dialog.locator("label", { hasText: "Des couchers plus doux" }).click();
    await expect(dialog.getByRole("radio", { name: /Des couchers plus doux/ })).toBeChecked();
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByRole("heading", { level: 1, name: "Voici Mō." })).toBeVisible();
    await dialog.getByRole("button", { name: "Suivant" }).click();

    await expectCatalogue(dialog);
    await dialog.getByRole("button", { name: "Suivant" }).click();

    expect(posts).toHaveLength(0);
    const moodSaved = page.waitForResponse(
      (r) => r.url().includes("/api/parent-mood") && r.request().method() === "POST"
    );
    await dialog.getByRole("button", { name: /Voir mon accueil|Ajouter mon enfant/ }).click();
    expect((await moodSaved).request().postDataJSON()).toMatchObject({ score: 4 });
    await expect(dialog).toBeHidden();
    await expect(page.locator("h1#page-title")).toBeVisible();
    expect(await uiState(page)).toMatchObject({ onboardingCompleted: true, onboardingGoal: "bedtime" });
    expect(posts).toHaveLength(1);
  });

  test("« Passer » mène au catalogue, jamais par-dessus, puis à la fin", async ({ page }) => {
    const dialog = await openFreshOnboarding(page);
    await dialog.getByRole("button", { name: "Commencer" }).click();
    await dialog.getByRole("button", { name: "Passer" }).click();
    await expectCatalogue(dialog);
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByRole("heading", { level: 1, name: /C’est parti/ })).toBeVisible();
    await dialog.getByRole("button", { name: /Voir mon accueil|Plus tard/ }).click();
    await expect(dialog).toBeHidden();
    expect(await uiState(page)).toMatchObject({ onboardingCompleted: true });

    await page.reload();
    await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("onboarding")).toHaveCount(0);
  });

  test("Échap mène d'abord au catalogue, puis ferme", async ({ page }) => {
    const dialog = await openFreshOnboarding(page);
    await page.keyboard.press("Escape");
    await expectCatalogue(dialog);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await uiState(page)).toMatchObject({ onboardingCompleted: true });
  });

  test("« Je préfère ne pas dire » choisi après coup n'envoie aucune humeur", async ({ page }) => {
    const posts = countMoodPosts(page);
    const dialog = await openFreshOnboarding(page);
    await dialog.getByRole("button", { name: "Commencer" }).click();
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await dialog.locator("label", { hasText: "Plutôt fier·e" }).click();
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await dialog.getByRole("button", { name: "Retour" }).click();
    await dialog.locator("label", { hasText: "Je préfère ne pas dire" }).click();
    await dialog.getByRole("button", { name: "Passer" }).click();
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await dialog.getByRole("button", { name: /Voir mon accueil|Plus tard/ }).click();
    await expect(dialog).toBeHidden();
    await page.waitForTimeout(500);
    expect(posts).toHaveLength(0);
  });

  test("le focus reste dans le parcours : la page dessous est inerte", async ({ page }) => {
    const dialog = await openFreshOnboarding(page);
    await dialog.getByRole("button", { name: "Commencer" }).click();
    await expect(page.locator("#root")).toHaveJSProperty("inert", true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const inPage = await page.evaluate(
        () => !!document.getElementById("root")?.contains(document.activeElement)
      );
      expect(inPage, `Tab n° ${i + 1}`).toBe(false);
    }
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#root")).toHaveJSProperty("inert", false);
  });
});
