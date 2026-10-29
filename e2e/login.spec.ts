import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login page", () => {
  test("displays login and register tabs", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Tokō");
    await expect(page.getByRole("tab", { name: "Connexion" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Inscription" })).toBeVisible();
  });

  test("login with demo credentials redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#login-email").fill("demo@toko.app");
    await page.locator("#login-password").fill("demo1234");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    await expect(page.locator("h1#page-title")).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#login-email").clear();
    await page.locator("#login-email").fill("demo@toko.app");
    await page.locator("#login-password").clear();
    await page.locator("#login-password").fill("wrongpassword");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.locator("text=Identifiants incorrects").or(page.locator(".text-destructive"))).toBeVisible({
      timeout: 10_000,
    });
  });

  test("register tab shows name/email/password fields", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("tab", { name: "Inscription" }).click();

    await expect(page.locator("#register-name")).toBeVisible();
    await expect(page.locator("#register-email")).toBeVisible();
    await expect(page.locator("#register-password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Créer mon compte" })).toBeVisible();
  });

  test("Google sign-in button is visible", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
  });
});

test.describe("Sign-up with email verification", () => {
  async function register(page: Page, email: string) {
    await page.goto("/login?mode=register");
    await page.locator("#register-name").fill("Parent Fictif");
    await page.locator("#register-email").fill(email);
    await page.locator("#register-password").fill("motdepasse-e2e");
    await page.getByRole("checkbox", { name: /J'ai 18 ans ou plus/ }).check();
    await page.getByRole("button", { name: "Créer mon compte" }).click();
  }

  async function expectCheckEmailScreen(page: Page, email: string) {
    await expect(page.getByRole("heading", { name: "Vérifiez votre boîte mail" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole("button", { name: /Renvoyer l'e-mail \(dans \d+ s\)/ })).toBeDisabled();
    await expect(page).toHaveURL(/\/login/);
    const session = await page.request.get("/api/auth/get-session");
    expect(await session.json()).toBeNull();
  }

  test("a new address gets the check-your-inbox screen, not the dashboard", async ({ page }) => {
    const email = `e2e-${Date.now()}-${test.info().workerIndex}@example.test`;
    await register(page, email);
    await expectCheckEmailScreen(page, email);
  });

  test("an address that already has an account gets the very same screen", async ({ page }) => {
    await register(page, "demo@toko.app");
    await expectCheckEmailScreen(page, "demo@toko.app");
  });

  test("signing in before confirming says so and offers to resend", async ({ page }) => {
    const email = `e2e-unverified-${Date.now()}-${test.info().workerIndex}@example.test`;
    await register(page, email);
    await expect(page.getByRole("heading", { name: "Vérifiez votre boîte mail" })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "Retour à la connexion" }).click();
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill("motdepasse-e2e");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByRole("alert")).toContainText("pas encore confirmée", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
    await page.getByRole("button", { name: "Renvoyer l'e-mail" }).click();
    await expect(page.getByText("C'est renvoyé.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Renvoyer l'e-mail \(dans \d+ s\)/ })).toBeDisabled();
  });

  test("the confirmation link lands on sign-in, with a clear message either way", async ({ page }) => {
    await page.goto("/login?verified=1");
    await expect(page.getByRole("status")).toContainText("Votre adresse e-mail est confirmée");
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();

    await page.goto("/login?verified=1&error=TOKEN_EXPIRED");
    await expect(page.getByRole("status")).toContainText("Ce lien n'est plus valable");
  });
});
