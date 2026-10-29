import { test, expect } from "@playwright/test";

const MIN_SIZE = 44;

const INTERACTIVE_SELECTOR = [
  "button:not([aria-hidden='true'])",
  "a[href]:not([aria-hidden='true'])",
  "[role='button']:not([aria-hidden='true'])",
  "input:not([type='hidden'])",
  "select",
  "textarea",
].join(", ");

test.describe.skip("B10 — Touch target sizing", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("dashboard primary interactive elements ≥ 44px", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15_000 });

    const offenders = await page.evaluate(
      ({ selector, min }) => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
        const bad: Array<{
          tag: string;
          label: string;
          width: number;
          height: number;
        }> = [];
        for (const node of nodes) {
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          const style = window.getComputedStyle(node);
          if (style.visibility === "hidden" || style.display === "none") continue;
          if (rect.width < min || rect.height < min) {
            bad.push({
              tag: node.tagName.toLowerCase(),
              label:
                node.getAttribute("aria-label") ??
                node.textContent?.trim().slice(0, 40) ??
                "",
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        }
        return bad;
      },
      { selector: INTERACTIVE_SELECTOR, min: MIN_SIZE }
    );

    if (offenders.length > 0) {
      console.log("Touch target offenders:", offenders);
    }
    expect(offenders, "Tous les contrôles du dashboard doivent être ≥ 44×44 px").toEqual([]);
  });
});
