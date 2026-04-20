import { test, expect } from "@playwright/test";

// Login tests run WITHOUT auth
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login page", () => {
  test("displays login and register tabs", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Toko");
    await expect(page.getByRole("tab", { name: "Connexion" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Inscription" })).toBeVisible();
  });

  test("demo credentials are pre-filled", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("#login-email")).toHaveValue("demo@toko.app");
    await expect(page.locator("#login-password")).toHaveValue("demo1234");
  });

  test("login with demo credentials redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    await expect(
      page
        .getByRole("heading", { name: "Tableau de bord" })
        .or(page.getByRole("heading", { name: "Bienvenue sur Tokō" }))
    ).toBeVisible();
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
