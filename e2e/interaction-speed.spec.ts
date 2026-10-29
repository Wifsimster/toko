import { test, expect } from "@playwright/test";

const BUDGET_MS = 2000;

test.describe.skip("B1 — Daily interaction speed", () => {
  test("EveningCheck 'Top' vibe completes in ≤ 2s", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15_000 });

    const topButton = page.getByRole("button", { name: /top/i }).first();
    await topButton.waitFor({ state: "visible", timeout: 10_000 });

    const start = performance.now();
    await topButton.click();
    await expect(page.getByText(/enregistr[eé]/i).first()).toBeVisible({ timeout: BUDGET_MS });
    const elapsed = performance.now() - start;

    console.log(`EveningCheck Top: ${Math.round(elapsed)}ms`);
    expect(elapsed).toBeLessThanOrEqual(BUDGET_MS);
  });
});
