import { describe, it, expect } from "vitest";
import {
  createChildSchema,
  createSymptomSchema,
  createJournalEntrySchema,
} from "../index";

describe("createChildSchema", () => {
  it("accepts valid child data", () => {
    const result = createChildSchema.safeParse({
      name: "Lucas",
      birthDate: "2018-05-15",
      diagnosisType: "mixed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid diagnosis type", () => {
    const result = createChildSchema.safeParse({
      name: "Lucas",
      birthDate: "2018-05-15",
      diagnosisType: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("accepts child without diagnosisType (defaults to undefined)", () => {
    const result = createChildSchema.safeParse({
      name: "Lucas",
      birthDate: "2018-05-15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.diagnosisType).toBe("undefined");
    }
  });

  it("accepts child with gender", () => {
    const result = createChildSchema.safeParse({
      name: "Emma",
      birthDate: "2019-03-10",
      gender: "female",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createChildSchema.safeParse({
      name: "",
      birthDate: "2018-05-15",
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
