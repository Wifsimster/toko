import { test, expect, type Page } from "@playwright/test";
import { DAY_LEVEL_SYMPTOMS, stubSymptoms } from "./fixtures/symptoms";

test.describe("Symptoms page", () => {
  test("displays symptoms page with heading", async ({ page }) => {
    await page.goto("/symptoms");

    await expect(page.locator("h1")).toContainText("Symptômes");
    await expect(page.getByText("Suivi quotidien des symptômes")).toBeVisible();
  });

  test("add symptom button opens dialog", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    await page
      .locator("main")
      .getByRole("button", { name: "Ajouter", exact: true })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Nouveau relevé")).toBeVisible();
    await expect(dialog.getByText("Agitation", { exact: true })).toBeVisible();
    await expect(
      dialog.getByText("Concentration", { exact: true })
    ).toBeVisible();
    await expect(dialog.getByText("Impulsivité", { exact: true })).toBeVisible();
    await expect(dialog.getByText("Sommeil", { exact: true })).toBeVisible();
  });

  test("shows empty state or symptom list", async ({ page }) => {
    await page.goto("/symptoms");
    await page.waitForLoadState("networkidle");

    const hasSymptoms = await page
      .locator("main")
      .getByRole("button", { name: /Ajouter|Nouveau/i })
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page.getByText("Pas encore de relevé").isVisible().catch(() => false);
    const hasNoChild = await page.getByText("Sélectionnez un enfant").isVisible().catch(() => false);
    const hasNoMatch = await page
      .getByText("Aucun relevé ne correspond")
      .isVisible()
      .catch(() => false);

    expect(hasSymptoms || hasEmpty || hasNoChild || hasNoMatch).toBeTruthy();
  });
});

async function contrastOf(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    const rgb = (css: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        const x = v / 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const fg = lum(rgb(getComputedStyle(el).color));
    const bg = lum(rgb(getComputedStyle(el).backgroundColor));
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  });
}

test.describe("Symptoms page — direction Mō", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.describe("with one reading per day level", () => {
    test.beforeEach(async ({ page }) => {
      await stubSymptoms(page, DAY_LEVEL_SYMPTOMS);
      await page.goto("/symptoms");
      await expect(page.locator("main article")).toHaveCount(3);
    });

    test("filters are toggle buttons; the count is announced on change only", async ({ page }) => {
      const group = page.getByRole("group", { name: "Filtrer les relevés" });
      const all = group.getByRole("button", { name: "Toutes" });
      const mood = group.getByRole("button", { name: "Humeur difficile" });
      const live = page.locator("main [aria-live=polite]");

      await expect(all).toHaveAttribute("aria-pressed", "true");
      await expect(mood).toHaveAttribute("aria-pressed", "false");
      await expect(live).toHaveText("");

      await mood.click();
      await expect(mood).toHaveAttribute("aria-pressed", "true");
      await expect(all).toHaveAttribute("aria-pressed", "false");
      await expect(live).toHaveText("1 relevé affiché");
      await expect(page.locator("main article")).toHaveCount(1);

      await page.getByRole("button", { name: "Effacer", exact: true }).click();
      await expect(live).toHaveText("3 relevés affichés");
    });

    test("filters fit on one scrollable line on mobile", async ({ page }) => {
      const group = page.getByRole("group", { name: "Filtrer les relevés" });
      const tops = await group
        .getByRole("button")
        .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(new Set(tops).size).toBe(1);
      expect(await group.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    });

    for (const width of [390, 640]) {
      test(`keyboard focus shows the whole last filter at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        const group = page.getByRole("group", { name: "Filtrer les relevés" });
        const chips = group.getByRole("button");
        const count = await chips.count();

        await chips.first().focus();
        for (let i = 1; i < count; i++) await page.keyboard.press("Tab");
        const last = chips.nth(count - 1);
        await expect(last).toBeFocused();
        await expect(last).toHaveText("Sommeil perturbé");

        await expect
          .poll(async () => {
            const [chip, box] = await Promise.all([last.boundingBox(), group.boundingBox()]);
            return chip!.x >= box!.x + 4 && chip!.x + chip!.width <= box!.x + box!.width - 4;
          })
          .toBe(true);
      });
    }

    test("history shows no Mō and no mood emoji; levels keep their pastel", async ({ page }) => {
      const main = page.locator("main");
      await expect(main.locator("[data-mo]")).toHaveCount(0);
      await expect(main).not.toContainText(/[😀😐😟😌😤🔁]/u);

      const badge = (level: string) =>
        `main button[data-level=${level}] [data-slot=mood-badge]`;
      await expect(page.locator(badge("good"))).toHaveClass(/bg-surface-mint/);
      await expect(page.locator(badge("ok"))).toHaveClass(/bg-muted/);
      await expect(page.locator(badge("hard"))).toHaveClass(/bg-surface-peach/);
      for (const level of ["good", "ok", "hard"]) {
        expect(await contrastOf(page, badge(level)), level).toBeGreaterThanOrEqual(4.5);
      }

      const summary = page.locator("main button[data-level=good]");
      await summary.click();
      await expect(summary).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("main dl")).toBeVisible();
    });

    test("card actions and filter chips are at least 44 px", async ({ page }) => {
      const targets = page.locator("main [role=group] button, main article button");
      const count = await targets.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const box = await targets.nth(i).boundingBox();
        expect(box, `cible ${i}`).not.toBeNull();
        expect(box!.height, `cible ${i}`).toBeGreaterThanOrEqual(44);
        expect(box!.width, `cible ${i}`).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test("empty state shows a single, decorative Mō", async ({ page }) => {
    await stubSymptoms(page, []);
    await page.goto("/symptoms");
    await expect(page.getByRole("heading", { name: "Pas encore de relevé" })).toBeVisible();
    const mo = page.locator("main [data-mo]");
    await expect(mo).toHaveCount(1);
    await expect(mo).toHaveAttribute("aria-hidden", "true");
  });
});
