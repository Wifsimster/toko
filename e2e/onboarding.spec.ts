import { test, expect, type Page } from "@playwright/test";

// auth.setup.ts marque l'onboarding comme vu pour les autres specs. Ici on le
// rouvre en remettant `onboardingCompleted` à false avant le chargement.
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
  // Cold Vite compile of the lazy onboarding chunk on CI runners.
  await expect(dialog).toBeVisible({ timeout: 30_000 });
  return dialog;
}

const uiState = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("toko-ui") ?? "{}").state);

test.describe("Onboarding Mō", () => {
  test("parcours complet : humeur, objectif, retour à l'accueil", async ({ page }) => {
    const dialog = await openFreshOnboarding(page);

    await expect(dialog.getByRole("heading", { level: 1, name: "Tokō" })).toBeFocused();
    await dialog.getByRole("button", { name: "Commencer" }).click();

    // Pagination accessible : une liste, l'écran courant en aria-current.
    const progress = dialog.getByRole("list", { name: "Progression" });
    await expect(progress.getByRole("listitem")).toHaveCount(5);
    await expect(progress.locator('[aria-current="step"]')).toHaveText("Étape 1 sur 5");
    await expect(dialog.getByRole("heading", { level: 1 })).toBeFocused();

    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByRole("button", { name: "Retour" })).toBeVisible();
    const moodSaved = page.waitForResponse(
      (r) => r.url().includes("/api/parent-mood") && r.request().method() === "POST"
    );
    await dialog.locator("label", { hasText: "Calme" }).click();
    await expect(dialog.getByRole("radio", { name: "Calme" })).toBeChecked();
    await dialog.getByRole("button", { name: "Suivant" }).click();
    // « Calme » rejoint l'humeur du parent existante (échelle 1-5 : 4, « Bien »).
    const saved = await moodSaved;
    expect(saved.request().postDataJSON()).toMatchObject({ score: 4 });

    await dialog.locator("label", { hasText: "Des couchers plus doux" }).click();
    await expect(dialog.getByRole("radio", { name: /Des couchers plus doux/ })).toBeChecked();
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByRole("heading", { level: 1, name: "Voici Mō." })).toBeVisible();
    await dialog.getByRole("button", { name: "Suivant" }).click();

    // freemium-ethics-policy §4 : le catalogue Gratuit / Famille est visible
    // dès l'onboarding, en lecture seule (aucun bouton de paiement).
    await dialog.getByRole("button", { name: "Ce qui est gratuit, ce qui est payant" }).click();
    await expect(dialog.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(dialog.getByRole("heading", { level: 2, name: "Gratuit" })).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2, name: "Famille" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /essayer|payer|abonn|commencer l'essai/i })).toHaveCount(0);
    await expect(dialog.locator("[data-mo]")).toHaveCount(0);
    await dialog.getByRole("button", { name: "Revenir" }).click();

    // Le compte démo a déjà des enfants : la fin mène à l'accueil.
    await dialog.getByRole("button", { name: /Voir mon accueil|Ajouter mon enfant/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("h1#page-title")).toBeVisible();
    expect(await uiState(page)).toMatchObject({ onboardingCompleted: true, onboardingGoal: "bedtime" });
  });

  test("« Passer » ferme le parcours, qui ne revient pas au rechargement", async ({ page }) => {
    const dialog = await openFreshOnboarding(page);
    await dialog.getByRole("button", { name: "Commencer" }).click();
    await dialog.getByRole("button", { name: "Passer" }).click();
    await expect(dialog).toBeHidden();
    expect(await uiState(page)).toMatchObject({ onboardingCompleted: true });

    await page.reload();
    await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("onboarding")).toHaveCount(0);
  });

  test("Échap ferme aussi le parcours", async ({ page }) => {
    const dialog = await openFreshOnboarding(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await uiState(page)).toMatchObject({ onboardingCompleted: true });
  });
});
