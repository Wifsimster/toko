import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate as demo user", async ({ page }) => {
  await page.goto("/login");

  // Demo credentials are pre-filled, just submit
  await expect(page.locator("#login-email")).toHaveValue("demo@toko.app");
  await page.getByRole("button", { name: "Se connecter" }).click();

  // Wait for redirect to dashboard (may show welcome or full dashboard)
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(
    page.getByText("Tableau de bord").or(page.getByText("Bienvenue sur Tokō"))
  ).toBeVisible();

  await page.context().storageState({ path: authFile });
});
