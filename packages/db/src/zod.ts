import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { children } from "./schema/children";
import { symptoms } from "./schema/symptoms";
import { medication, medicationLogs } from "./schema/medication";
import { journalEntries } from "./schema/journal";

// Select schemas (full row from DB — used for response typing)
export const childSelectSchema = createSelectSchema(children);
export const symptomSelectSchema = createSelectSchema(symptoms);
export const medicationSelectSchema = createSelectSchema(medication);
export const medicationLogSelectSchema = createSelectSchema(medicationLogs);
export const journalEntrySelectSchema = createSelectSchema(journalEntries);

// Insert schemas (what the DB expects — used for drift detection)
export const childInsertSchema = createInsertSchema(children);
export const symptomInsertSchema = createInsertSchema(symptoms);
export const medicationInsertSchema = createInsertSchema(medication);
export const medicationLogInsertSchema = createInsertSchema(medicationLogs);
export const journalEntryInsertSchema = createInsertSchema(journalEntries);
