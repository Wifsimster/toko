import { describe, it, expect } from "vitest";
import {
  createChildSchema,
  createSymptomSchema,
  createMedicationSchema,
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
      social: 4,
      autonomy: 6,
    });
    expect(result.success).toBe(true);
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
      social: 4,
      autonomy: 6,
    });
    expect(result.success).toBe(false);
  });
});

describe("createMedicationSchema", () => {
  it("accepts valid medication data", () => {
    const result = createMedicationSchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Ritaline",
      dose: "10mg",
      scheduledAt: "08:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid time format", () => {
    const result = createMedicationSchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Ritaline",
      dose: "10mg",
      scheduledAt: "8am",
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
      moodRating: 4,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tag", () => {
    const result = createJournalEntrySchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      text: "Test",
      tags: ["invalid_tag"],
      moodRating: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mood rating out of range", () => {
    const result = createJournalEntrySchema.safeParse({
      childId: "550e8400-e29b-41d4-a716-446655440000",
      date: "2024-01-15",
      text: "Test",
      tags: [],
      moodRating: 5,
    });
    expect(result.success).toBe(false);
  });
});
