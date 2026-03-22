import { z } from "zod";

export const createMedicationSchema = z.object({
  childId: z.string().uuid(),
  name: z.string().min(1).max(200),
  dose: z.string().min(1).max(100),
  scheduledAt: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM attendu"),
  active: z.boolean().default(true),
});

export const updateMedicationSchema = createMedicationSchema
  .partial()
  .omit({ childId: true });

export const medicationSchema = createMedicationSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const medicationLogStatusSchema = z.enum([
  "taken",
  "skipped",
  "delayed",
]);

export const createMedicationLogSchema = z.object({
  medicationId: z.string().uuid(),
  date: z.string().date(),
  status: medicationLogStatusSchema,
  takenAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const medicationLogSchema = createMedicationLogSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type CreateMedication = z.infer<typeof createMedicationSchema>;
export type UpdateMedication = z.infer<typeof updateMedicationSchema>;
export type Medication = z.infer<typeof medicationSchema>;
export type MedicationLogStatus = z.infer<typeof medicationLogStatusSchema>;
export type CreateMedicationLog = z.infer<typeof createMedicationLogSchema>;
export type MedicationLog = z.infer<typeof medicationLogSchema>;
