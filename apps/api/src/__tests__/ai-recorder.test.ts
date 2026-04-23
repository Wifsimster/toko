import { describe, it, expect } from "vitest";
import { recordRecommendationSchema } from "@focusflow/validators";

describe("recordRecommendationSchema", () => {
  it("accepts a minimal payload", () => {
    const result = recordRecommendationSchema.safeParse({
      modelVersion: "claude-opus-4-7",
      promptTemplate: "evening-debrief-v1",
      inputs: { agitation: 7, focus: 3 },
      suggestion: "Demain, essayez de raccourcir l'étape devoirs.",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.evidence).toEqual([]);
  });

  it("accepts evidence items", () => {
    const result = recordRecommendationSchema.safeParse({
      modelVersion: "claude-opus-4-7",
      promptTemplate: "v1",
      inputs: {},
      suggestion: "ok",
      evidence: [{ type: "symptom_avg", ref: "agitation_7d", value: 6.5 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty suggestion", () => {
    const result = recordRecommendationSchema.safeParse({
      modelVersion: "x",
      promptTemplate: "x",
      inputs: {},
      suggestion: "",
    });
    expect(result.success).toBe(false);
  });
});
