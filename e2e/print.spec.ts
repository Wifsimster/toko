import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outDir = process.env.PRINT_EVIDENCE_DIR;

async function expectChromeHidden(page: Page) {
  await expect(page.locator('[data-sidebar="sidebar"]')).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Ouvrir le mode SOS Crise" })).toBeHidden();
  await expect(page.locator("[data-sonner-toaster]")).toBeHidden();
  await expect(page.locator("header.sticky")).toBeHidden();
}

async function printedText(page: Page, name: string) {
  await page.waitForTimeout(600);
  await page.emulateMedia({ media: "print" });
  const text = await page.evaluate(() => document.body.innerText.trim());
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, `${name}.pdf`), await page.pdf({ format: "A4", printBackground: true }));
  }
  return text;
}

test.describe("Impression", () => {
  test("plan de crise imprime son contenu", async ({ page }) => {
    await page.goto("/ressources/plan-de-crise");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    const text = await printedText(page, "plan-de-crise");
    expect(text.length).toBeGreaterThan(200);
    expect(text).toContain("crise");
    await expect(page.locator(".plan-de-crise-controls")).toBeHidden();
    await expectChromeHidden(page);
  });

  test("résultat de quiz imprime son contenu", async ({ page }) => {
    await page.goto("/quiz/tdah-adulte");
    await page.getByRole("button", { name: /commencer|démarrer|débuter/i }).first().click();
    const result = page.locator(".quiz-result");
    const radio = page.getByRole("radio").first();
    const next = page.getByRole("button", { name: /continuer/i }).first();
    let finished = false;
    for (let i = 0; i < 400 && !finished; i++) {
      await expect(result.or(radio).or(next).first()).toBeVisible({ timeout: 5_000 });
      if (await result.isVisible()) finished = true;
      else if (await radio.isVisible()) await radio.click({ timeout: 3_000 });
      else await next.click({ timeout: 3_000 });
      await page.waitForTimeout(260);
    }
    expect(finished, "le questionnaire n'a pas atteint le résultat").toBe(true);
    await expect(page.locator(".quiz-result")).toBeVisible();
    const text = await printedText(page, "quiz-result");
    expect(text.length).toBeGreaterThan(200);
    await expect(page.locator(".quiz-result")).toBeVisible();
    await expectChromeHidden(page);
  });

  test("rapport imprime son contenu", async ({ page }) => {
    await page.goto("/report");
    await expect(page.locator("h1", { hasText: "Carnet de consultation TDAH" })).toBeVisible({ timeout: 15_000 });
    const text = await printedText(page, "report");
    expect(text.length).toBeGreaterThan(200);
    await expectChromeHidden(page);
  });
});
