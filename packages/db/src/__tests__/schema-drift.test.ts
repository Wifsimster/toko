import { describe, it, expect } from "vitest";
import {
  childInsertSchema,
  symptomInsertSchema,
  medicationInsertSchema,
  medicationLogInsertSchema,
  journalEntryInsertSchema,
} from "../zod";
import {
  createChildSchema,
  createSymptomSchema,
  createMedicationSchema,
  createMedicationLogSchema,
  createJournalEntrySchema,
} from "@focusflow/validators";

/**
 * Schema drift detection tests.
 *
 * These tests verify that the Zod validator schemas (API boundary)
 * cover all fields expected by the Drizzle insert schemas (DB boundary).
 * If a column is added to a Drizzle table but not to the corresponding
 * validator, these tests will fail.
 */

function getSchemaKeys(schema: { shape: Record<string, unknown> }): string[] {
  return Object.keys(schema.shape).sort();
}

// Fields managed by the DB (auto-generated), not expected in create schemas
const DB_MANAGED_FIELDS = ["id", "createdAt", "updatedAt", "parentId"];

function getUserFacingKeys(
  insertSchema: { shape: Record<string, unknown> },
  extraExclusions: string[] = []
): string[] {
  const exclude = new Set([...DB_MANAGED_FIELDS, ...extraExclusions]);
  return getSchemaKeys(insertSchema).filter((k) => !exclude.has(k));
}

describe("Schema drift detection: Drizzle ↔ Validators", () => {
  it("children: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(childInsertSchema);
    const validatorKeys = getSchemaKeys(createChildSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("symptoms: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(symptomInsertSchema);
    const validatorKeys = getSchemaKeys(createSymptomSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("medication: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(medicationInsertSchema);
    const validatorKeys = getSchemaKeys(createMedicationSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("medication_logs: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(medicationLogInsertSchema);
    const validatorKeys = getSchemaKeys(createMedicationLogSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("journal_entries: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(journalEntryInsertSchema);
    const validatorKeys = getSchemaKeys(createJournalEntrySchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });
});
