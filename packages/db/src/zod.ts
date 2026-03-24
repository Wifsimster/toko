import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { children } from "./schema/children";
import { symptoms } from "./schema/symptoms";
import { journalEntries } from "./schema/journal";
import {
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
} from "./schema/barkley";

// Select schemas (full row from DB — used for response typing)
export const childSelectSchema = createSelectSchema(children);
export const symptomSelectSchema = createSelectSchema(symptoms);
export const journalEntrySelectSchema = createSelectSchema(journalEntries);
export const barkleyStepSelectSchema = createSelectSchema(barkleySteps);
export const barkleyBehaviorSelectSchema = createSelectSchema(barkleyBehaviors);
export const barkleyBehaviorLogSelectSchema =
  createSelectSchema(barkleyBehaviorLogs);

// Insert schemas (what the DB expects — used for drift detection)
export const childInsertSchema = createInsertSchema(children);
export const symptomInsertSchema = createInsertSchema(symptoms);
export const journalEntryInsertSchema = createInsertSchema(journalEntries);
export const barkleyStepInsertSchema = createInsertSchema(barkleySteps);
export const barkleyBehaviorInsertSchema =
  createInsertSchema(barkleyBehaviors);
export const barkleyBehaviorLogInsertSchema =
  createInsertSchema(barkleyBehaviorLogs);
