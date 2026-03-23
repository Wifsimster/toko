import { test, expect } from "@playwright/test";

test.describe("Appointments page", () => {
  test("displays appointments page with heading", async ({ page }) => {
    await page.goto("/appointments");

    await expect(page.locator("h1")).toContainText("Rendez-vous");
    await expect(page.getByText("Calendrier des consultations")).toBeVisible();
  });

  test("new appointment button opens dialog", async ({ page }) => {
    await page.goto("/appointments");

    await page.getByRole("button", { name: "Nouveau RDV" }).click();

    await expect(page.getByText("Nouveau rendez-vous")).toBeVisible();
    await expect(page.locator("#apt-title")).toBeVisible();
    await expect(page.locator("#apt-date")).toBeVisible();
    await expect(page.locator("#apt-time")).toBeVisible();
    await expect(page.locator("#apt-location")).toBeVisible();
    await expect(page.locator("#apt-notes")).toBeVisible();
  });

  test("shows empty state or appointment list", async ({ page }) => {
    await page.goto("/appointments");
    await page.waitForLoadState("networkidle");

    const hasAppointments = await page.getByText("À venir").isVisible().catch(() => false);
    const hasEmpty = await page.getByText("Aucun rendez-vous").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);

    expect(hasAppointments || hasEmpty || hasNoChild).toBeTruthy();
  });
});
