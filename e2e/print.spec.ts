import { test, expect, type Locator, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outDir = process.env.PRINT_EVIDENCE_DIR;

type Chrome = "header" | "sos" | "sidebar" | "tabBar";

function chromeElements(page: Page, isMobile: boolean, chrome: Chrome[]) {
  const all: Record<Chrome, { name: string; locator: Locator }> = {
    header: { name: "en-tête", locator: page.locator("header.sticky") },
    sos: { name: "bouton SOS", locator: page.getByRole("button", { name: "Ouvrir le mode SOS Crise" }) },
    sidebar: { name: "barre latérale", locator: page.locator('[data-sidebar="sidebar"]') },
    tabBar: { name: "barre d'onglets mobile", locator: page.getByRole("navigation", { name: "Navigation principale" }) },
  };
  return chrome
    .filter((key) => (key === "sidebar" ? !isMobile : key === "tabBar" ? isMobile : true))
    .map((key) => all[key]);
}

async function expectChromeVisibleOnScreen(page: Page, isMobile: boolean, chrome: Chrome[]) {
  await page.emulateMedia({ media: "screen" });
  for (const { name, locator } of chromeElements(page, isMobile, chrome)) {
    await expect(locator.first(), `${name} visible à l'écran`).toBeVisible();
  }
}

async function expectChromeHidden(page: Page, isMobile: boolean, chrome: Chrome[]) {
  for (const { name, locator } of chromeElements(page, isMobile, chrome)) {
    await expect(locator.first(), `${name} masqué à l'impression`).toBeHidden();
  }
}

const planChrome: Chrome[] = [];
const quizChrome: Chrome[] = ["header"];
const reportChrome: Chrome[] = ["header", "sos", "sidebar", "tabBar"];

test.beforeEach(({}, testInfo) => {
  testInfo.annotations.push({
    type: "skip-élément",
    description: "toaster Sonner : aucun toast déclenchable à bas coût sur ces pages, absent du DOM tant qu'aucun toast n'est affiché",
  });
});

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
  test("plan de crise imprime son contenu", async ({ page, isMobile }) => {
    await page.goto("/ressources/plan-de-crise");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
    await expectChromeVisibleOnScreen(page, isMobile, planChrome);
    await expect(page.locator(".plan-de-crise-controls")).toBeVisible();
    const text = await printedText(page, "plan-de-crise");
    expect(text.length).toBeGreaterThan(200);
    expect(text).toContain("crise");
    await expect(page.locator(".plan-de-crise-controls")).toBeHidden();
    await expectChromeHidden(page, isMobile, planChrome);
  });

  test("résultat de quiz imprime son contenu", async ({ page, isMobile }) => {
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
    await expectChromeVisibleOnScreen(page, isMobile, quizChrome);
    const text = await printedText(page, "quiz-result");
    expect(text.length).toBeGreaterThan(200);
    await expect(page.locator(".quiz-result")).toBeVisible();
    await expectChromeHidden(page, isMobile, quizChrome);
  });

  test("rapport imprime son contenu", async ({ page, isMobile }) => {
    await page.goto("/report");
    await expect(page.locator("h1", { hasText: "Carnet de consultation TDAH" })).toBeVisible({ timeout: 15_000 });
    await expectChromeVisibleOnScreen(page, isMobile, reportChrome);
    const text = await printedText(page, "report");
    expect(text.length).toBeGreaterThan(200);
    await expectChromeHidden(page, isMobile, reportChrome);
  });
});
