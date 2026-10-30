import { test, expect } from "@playwright/test";

test.describe("SOS crise", () => {
  test("une scène calme de Mō, décorative, sur le choix, le sensoriel et la diversion ; la respiration garde son Mō seul", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Ouvrir le mode SOS Crise" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Techniques de désamorçage de crise" });
    await expect(dialog).toBeVisible();

    for (const [label, scene] of [
      [null, "choix"],
      [/Isolation sensorielle/, "sensoriel"],
      [/^Diversion/, "diversion"],
    ] as const) {
      if (label) await dialog.getByRole("button", { name: label }).click();
      const tile = dialog.getByTestId("sos-scene");
      await expect(tile).toHaveCount(1);
      await expect(tile).toHaveAttribute("data-scene", scene);
      await expect(tile).toHaveAttribute("aria-hidden", "true");
      await expect(tile.locator("svg path").first()).toBeAttached();
      if (label) await dialog.getByRole("button", { name: "Retour" }).click();
    }

    await dialog.getByRole("button", { name: /Respiration guidée/ }).click();
    await expect(dialog.getByRole("heading", { name: "Respirez avec moi" })).toBeVisible();
    await expect(dialog.getByTestId("sos-scene")).toHaveCount(0);
  });

  test("les quatre étapes sensorielles restent visibles sous la scène sur un téléphone de 390 × 844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Ouvrir le mode SOS Crise" }).first().click();
    await page.getByRole("button", { name: /Isolation sensorielle/ }).click();
    await expect(page.getByTestId("sos-scene").locator("svg path").first()).toBeAttached();
    const steps = page.getByRole("dialog").getByRole("listitem");
    await expect(steps).toHaveCount(4);
    for (let i = 0; i < 4; i++) await expect(steps.nth(i)).toBeInViewport({ ratio: 1 });
  });
});
