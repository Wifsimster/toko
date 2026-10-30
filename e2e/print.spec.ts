import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outDir = process.env.PRINT_EVIDENCE_DIR;

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
  });

  test("résultat de quiz imprime son contenu", async ({ page }) => {
    await page.goto("/quiz/tdah-adulte");
    await page.getByRole("button", { name: /commencer|démarrer|débuter/i }).first().click();
    for (let i = 0; i < 200; i++) {
      if (await page.locator(".quiz-result").isVisible()) break;
      await page.locator("[role=radio], [role=radiogroup] button, fieldset button").first().click({ timeout: 3_000 }).catch(async () => {
        await page.getByRole("button", { name: /continuer|suivant|commencer/i }).first().click({ timeout: 1_000 }).catch(() => {});
      });
      await page.waitForTimeout(260);
    }
    await expect(page.locator(".quiz-result")).toBeVisible();
    const text = await printedText(page, "quiz-result");
    expect(text.length).toBeGreaterThan(200);
    await expect(page.locator(".quiz-result")).toBeVisible();
  });

  test("rapport imprime son contenu", async ({ page }) => {
    await page.goto("/report");
    await expect(page.locator("h1", { hasText: "Carnet de consultation TDAH" })).toBeVisible({ timeout: 15_000 });
    const text = await printedText(page, "report");
    expect(text.length).toBeGreaterThan(200);
  });
});
