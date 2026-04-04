import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { children } from "./schema/children";
import { symptoms } from "./schema/symptoms";
import { journalEntries } from "./schema/journal";
import {
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
  barkleyRewards,
} from "./schema/barkley";
import { crisisItems } from "./schema/crisis-list";
import { subscription } from "./schema/subscriptions";

// Select schemas (full row from DB — used for response typing)
export const childSelectSchema = createSelectSchema(children);
export const symptomSelectSchema = createSelectSchema(symptoms);
export const journalEntrySelectSchema = createSelectSchema(journalEntries);
export const barkleyStepSelectSchema = createSelectSchema(barkleySteps);
export const barkleyBehaviorSelectSchema = createSelectSchema(barkleyBehaviors);
export const barkleyBehaviorLogSelectSchema =
  createSelectSchema(barkleyBehaviorLogs);
export const barkleyRewardSelectSchema = createSelectSchema(barkleyRewards);
export const crisisItemSelectSchema = createSelectSchema(crisisItems);
export const subscriptionSelectSchema = createSelectSchema(subscription);

// Insert schemas (what the DB expects — used for drift detection)
export const childInsertSchema = createInsertSchema(children);
export const symptomInsertSchema = createInsertSchema(symptoms);
export const journalEntryInsertSchema = createInsertSchema(journalEntries);
export const barkleyStepInsertSchema = createInsertSchema(barkleySteps);
export const barkleyBehaviorInsertSchema =
  createInsertSchema(barkleyBehaviors);
export const barkleyBehaviorLogInsertSchema =
  createInsertSchema(barkleyBehaviorLogs);
export const barkleyRewardInsertSchema = createInsertSchema(barkleyRewards);
export const crisisItemInsertSchema = createInsertSchema(crisisItems);
export const subscriptionInsertSchema = createInsertSchema(subscription);
