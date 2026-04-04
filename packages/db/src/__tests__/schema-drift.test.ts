import { describe, it, expect } from "vitest";
import {
  childInsertSchema,
  symptomInsertSchema,
  journalEntryInsertSchema,
  barkleyStepInsertSchema,
  barkleyBehaviorInsertSchema,
  barkleyBehaviorLogInsertSchema,
  barkleyRewardInsertSchema,
  crisisItemInsertSchema,
} from "../zod";
import {
  createChildSchema,
  createSymptomSchema,
  createJournalEntrySchema,
  createBarkleyStepSchema,
  createBarkleyBehaviorSchema,
  createBarkleyBehaviorLogSchema,
  createBarkleyRewardSchema,
  createCrisisItemSchema,
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

  it("journal_entries: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(journalEntryInsertSchema);
    const validatorKeys = getSchemaKeys(createJournalEntrySchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("barkley_steps: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(barkleyStepInsertSchema, ["completedAt"]);
    const validatorKeys = getSchemaKeys(createBarkleyStepSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("barkley_behaviors: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(barkleyBehaviorInsertSchema, ["active"]);
    const validatorKeys = getSchemaKeys(createBarkleyBehaviorSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("barkley_behavior_logs: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(barkleyBehaviorLogInsertSchema, ["notes"]);
    const validatorKeys = getSchemaKeys(createBarkleyBehaviorLogSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("barkley_rewards: validator covers all DB insert fields", () => {
    // claimedAt + timesClaimed are server-managed (set on claim mutation)
    const dbKeys = getUserFacingKeys(barkleyRewardInsertSchema, [
      "claimedAt",
      "timesClaimed",
    ]);
    const validatorKeys = getSchemaKeys(createBarkleyRewardSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });

  it("crisis_items: validator covers all DB insert fields", () => {
    const dbKeys = getUserFacingKeys(crisisItemInsertSchema);
    const validatorKeys = getSchemaKeys(createCrisisItemSchema);

    expect(validatorKeys).toEqual(expect.arrayContaining(dbKeys));
  });
});
