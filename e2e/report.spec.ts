import { test, expect } from "@playwright/test";

test.describe("Carnet de consultation TDAH", () => {
  test("report route renders for any authenticated user", async ({ page }) => {
    // Since #105, the basic Carnet de consultation is free for every
    // authenticated user — no full-page paywall. The h1 is always visible.
    // Warm the session by hitting /dashboard first: when /report is the
    // first authenticated navigation in a fresh context the Better Auth
    // cookie-cache (5 min TTL) can be expired, which sends us to /login.
    await page.goto("/dashboard");
    await expect(page.locator("h1#page-title")).toBeVisible({ timeout: 15_000 });

    await page.goto("/report");
    await expect(
      page.locator("h1", { hasText: "Carnet de consultation TDAH" }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("paid account shows the full controls and document sections", async ({
    page,
  }) => {
    await page.goto("/report");
    await page.waitForLoadState("networkidle");

    // Demo account is on Famille, so the 90-day default + email-to-doctor
    // controls + the multi-child entry point should all render. We probe
    // a paid-only signal first and skip if the demo lapses for any reason.
    const sendButton = page.getByRole("button", { name: /^Envoyer$/ });
    const isPaid = await sendButton.isVisible().catch(() => false);

    test.skip(
      !isPaid,
      "Demo account has no active subscription — paid controls not rendered",
    );

    await expect(
      page.getByRole("button", { name: /Télécharger en PDF/ }),
    ).toBeVisible();

    await expect(
      page.getByText("Synthèse de la période (90 jours)"),
    ).toBeVisible();
    await expect(
      page.getByText("Moyennes par dimension (échelle 1-5)"),
    ).toBeVisible();
    await expect(
      page.getByText("Moments marquants du journal"),
    ).toBeVisible();
    await expect(
      page.getByText(/ne constitue pas un diagnostic médical/),
    ).toBeVisible();
  });

  test("account page links to the report page", async ({ page }) => {
    await page.goto("/account");

    // 30s timeout covers the GH runner's cold Vite dev-mode compile of
    // the account route (NotificationsCard + billing portal deps).
    await expect(page.getByText("Rapport médical").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText(/Synthèse PDF à apporter en consultation/),
    ).toBeVisible();
  });
});
