import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  ARTICLE_META,
  computeSignals,
  pickSuggestedArticle,
} from "../lib/knowledge-suggestions";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_PATH = resolve(
  __dirname,
  "../../../../apps/web/src/lib/resources-data.tsx"
);

describe("ARTICLE_META ↔ resources-data.tsx sync", () => {
  const frontendSource = readFileSync(RESOURCES_PATH, "utf8");

  it("every API slug exists in the frontend article list", () => {
    for (const meta of ARTICLE_META) {
      expect(
        frontendSource,
        `slug "${meta.slug}" not found in resources-data.tsx`
      ).toContain(`slug: "${meta.slug}"`);
    }
  });

  it("every API trigger appears in the frontend article triggers", () => {
    for (const meta of ARTICLE_META) {
      for (const trigger of meta.triggers) {
        expect(
          frontendSource,
          `trigger "${trigger}" not found on any frontend article`
        ).toContain(`"${trigger}"`);
      }
    }
  });
});

describe("pickSuggestedArticle", () => {
  const baseWeek = Array.from({ length: 5 }, () => ({
    focus: 5,
    mood: 5,
    agitation: 5,
    impulse: 5,
    sleep: 5,
    routinesOk: true,
  }));

  it("returns null when no signal crosses threshold", () => {
    const signals = computeSignals(baseWeek, "stable", 80);
    expect(pickSuggestedArticle(signals)).toBeNull();
  });

  it("returns null when fewer than 3 entries", () => {
    expect(computeSignals(baseWeek.slice(0, 2), "stable", 80)).toBeNull();
  });

  it("picks the sleep article when sleep is low", () => {
    const week = baseWeek.map((d) => ({ ...d, sleep: 2 }));
    const signals = computeSignals(week, "stable", 80);
    const article = pickSuggestedArticle(signals);
    expect(article?.slug).toBe("troubles-sommeil-tdah-enfant");
  });

  it("picks a crisis article when agitation and mood both flag", () => {
    const week = baseWeek.map((d) => ({ ...d, agitation: 9, mood: 2 }));
    const signals = computeSignals(week, "stable", 80);
    const article = pickSuggestedArticle(signals);
    // crise-tdah (3 triggers) should outrank dysregulation (2 triggers)
    expect(article?.slug).toBe("crise-tdah-enfant-guide-complet");
  });

  it("picks co-regulation when mood trend is down + low consistency", () => {
    const signals = computeSignals(baseWeek, "down", 25);
    const article = pickSuggestedArticle(signals);
    expect(article?.slug).toBe("co-regulation-parent-enfant-tdah");
  });
});
