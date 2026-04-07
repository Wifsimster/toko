import { test as setup, expect } from "@playwright/test"
import path from "path"

const authFile = path.join(__dirname, ".auth/user.json")

setup("authenticate as demo user", async ({ page }) => {
  await page.goto("/login")

  const signInRes = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: "demo@toko.app",
      password: "demo1234",
    },
  })

  if (!signInRes.ok()) {
    throw new Error(`Sign-in failed: ${signInRes.status()} ${await signInRes.text()}`)
  }

  await page.goto("/dashboard")

  await expect(
    page.getByText("Tableau de bord").or(page.getByText("Bienvenue sur Tokō"))
  ).toBeVisible({ timeout: 15_000 })

  await page.context().storageState({ path: authFile })
})
