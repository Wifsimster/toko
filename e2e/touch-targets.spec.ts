import { test, expect } from "@playwright/test";

// Business rule B10: interactive elements on mobile must be at least
// 44×44 CSS pixels. Measured via live bounding boxes on the dashboard
// using the mobile-chrome viewport defined in playwright.config.ts.
const MIN_SIZE = 44;

// Tight enough list that the test fails loudly when a new UI lands with
// a sub-44px control. Skipped elements:
// - aria-hidden="true" (decorative)
// - display contents / height 0 (popover triggers collapsed)
const INTERACTIVE_SELECTOR = [
  "button:not([aria-hidden='true'])",
  "a[href]:not([aria-hidden='true'])",
  "[role='button']:not([aria-hidden='true'])",
  "input:not([type='hidden'])",
  "select",
  "textarea",
].join(", ");

test.describe("B10 — Touch target sizing", () => {
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
          // Skip invisible / offscreen elements — they're not tappable.
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
