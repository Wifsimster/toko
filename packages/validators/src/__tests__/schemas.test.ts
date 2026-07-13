import { describe, it, expect } from "vitest";
import {
  createChildSchema,
  createSymptomSchema,
  createJournalEntrySchema,
  createEventSchema,
  consentTypeSchema,
  grantConsentSchema,
} from "../index";

describe("createChildSchema", () => {
  it("accepts valid child data", () => {
    const result = createChildSchema.safeParse({
      name: "Lucas",
      ageRange: "6-8",
      diagnosisType: "mixed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid diagnosis type", () => {
    const result = createChildSchema.safeParse({
      name: "Lucas",
      ageRange: "6-8",
      diagnosisType: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("accepts child without diagnosisType (defaults to undefined)", () => {
    const result = createChildSchema.safeParse({
      name: "Lucas",
      ageRange: "6-8",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.diagnosisType).toBe("undefined");
    }
  });

  it("accepts child with gender", () => {
    const result = createChildSchema.safeParse({
      name: "Emma",
      ageRange: "6-8",
      gender: "female",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createChildSchema.safeParse({
      name: "",
      ageRange: "6-8",
      diagnosisType: "inattentive",
    });
    expect(result.success).toBe(false);
  });
});

describe("createSymptomSchema", () => {
  it("accepts valid symptom data", () => {
    const result = createSymptomSchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      agitation: 7,
      focus: 3,
      impulse: 5,
      mood: 6,
      sleep: 8,
      routinesOk: true,
    });
    expect(result.success).toBe(true);
  });

  it("defaults routinesOk to true when omitted", () => {
    const result = createSymptomSchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      agitation: 5,
      focus: 5,
      impulse: 5,
      mood: 5,
      sleep: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.routinesOk).toBe(true);
    }
  });

  it("rejects out-of-range values", () => {
    const result = createSymptomSchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      agitation: 11,
      focus: 3,
      impulse: 5,
      mood: 6,
      sleep: 8,
      routinesOk: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("createJournalEntrySchema", () => {
  it("accepts valid journal entry", () => {
    const result = createJournalEntrySchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      text: "Bonne journée, concentré en classe.",
      tags: ["school", "victory"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tag", () => {
    const result = createJournalEntrySchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      text: "Test",
      tags: ["invalid_tag"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts entry with empty text and no tags (defaults)", () => {
    const result = createJournalEntrySchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("");
      expect(result.data.tags).toEqual([]);
    }
  });
});

describe("createEventSchema", () => {
  it("accepts a known event with empty properties", () => {
    const result = createEventSchema.safeParse({
      eventName: "signup_completed",
      sessionId: "s_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.properties).toEqual({});
    }
  });

  it("rejects an unknown event name", () => {
    const result = createEventSchema.safeParse({
      eventName: "rogue_event",
      sessionId: "s_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty sessionId", () => {
    const result = createEventSchema.safeParse({
      eventName: "paywall_viewed",
      sessionId: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts sos_helpful_rating with a boolean property", () => {
    const result = createEventSchema.safeParse({
      eventName: "sos_helpful_rating",
      sessionId: "s_abc123",
      properties: { helpful: true },
    });
    expect(result.success).toBe(true);
  });

  it("accepts trial_started", () => {
    const result = createEventSchema.safeParse({
      eventName: "trial_started",
      sessionId: "s_abc123",
    });
    expect(result.success).toBe(true);
  });
});

describe("consent schemas", () => {
  it("accepts the owner health-processing consent type", () => {
    expect(consentTypeSchema.safeParse("owner_health_processing").success).toBe(
      true
    );
  });

  it("still accepts terms and privacy types", () => {
    expect(consentTypeSchema.safeParse("terms").success).toBe(true);
    expect(consentTypeSchema.safeParse("privacy").success).toBe(true);
  });

  it("rejects an unknown consent type", () => {
    expect(consentTypeSchema.safeParse("marketing").success).toBe(false);
  });

  it("grantConsentSchema requires a non-empty version", () => {
    expect(
      grantConsentSchema.safeParse({ type: "owner_health_processing", version: "" })
        .success
    ).toBe(false);
    expect(
      grantConsentSchema.safeParse({
        type: "owner_health_processing",
        version: "2026-07-13",
      }).success
    ).toBe(true);
  });
});
