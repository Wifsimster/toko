import { describe, it, expect } from "vitest";
import { articles } from "../resources-data";
import type { ArticleTrigger } from "../resources-types";

const VALID_TRIGGERS: ArticleTrigger[] = [
  "sleep:low",
  "focus:low",
  "mood:low",
  "agitation:high",
  "impulse:high",
  "routines:broken",
  "crisis:recent",
  "mood-trend:down",
  "consistency:low",
];

describe("article triggers", () => {
  it("each trigger used on an article is a valid known trigger", () => {
    for (const article of articles) {
      for (const trigger of article.triggers ?? []) {
        expect(VALID_TRIGGERS).toContain(trigger);
      }
    }
  });

  it("at least one parent-facing article carries each core symptom trigger", () => {
    const coreTriggers: ArticleTrigger[] = [
      "sleep:low",
      "focus:low",
      "mood:low",
      "agitation:high",
    ];
    for (const trig of coreTriggers) {
      const match = articles.find(
        (a) =>
          a.audience !== "entourage" && (a.triggers ?? []).includes(trig)
      );
      expect(match, `no article covers ${trig}`).toBeTruthy();
    }
  });

  it("entourage articles carry no triggers (not dashboard-surfaced)", () => {
    for (const article of articles) {
      if (article.audience === "entourage") {
        expect(article.triggers ?? []).toHaveLength(0);
      }
    }
  });
});
