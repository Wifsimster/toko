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

  // The dashboard <h1 id="page-title"> holds either the time-of-day
  // greeting (when children exist) or "Bienvenue sur Tokō" on the
  // welcome screen — the stable id is the right anchor for both.
  await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 15_000 })

  // Mark the OnboardingTour as already completed in the persisted
  // Zustand state so it doesn't open on every test (the modal blocks
  // most interactions, which makes assertions on buttons hang at the
  // default 30s timeout). Real users only see the tour once per
  // localStorage; tests should land on the post-onboarding state.
  await page.evaluate(() => {
    const raw = window.localStorage.getItem("toko-ui")
    const parsed: { state?: Record<string, unknown>; version?: number } =
      raw ? JSON.parse(raw) : { state: {}, version: 0 }
    parsed.state = { ...(parsed.state ?? {}), onboardingCompleted: true }
    window.localStorage.setItem("toko-ui", JSON.stringify(parsed))
  })

  await page.context().storageState({ path: authFile })
})
