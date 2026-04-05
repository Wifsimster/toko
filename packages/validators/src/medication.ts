import { z } from "zod";

export const medicationScheduleSchema = z.enum([
  "morning",
  "noon",
  "evening",
  "bedtime",
  "custom",
]);

export const createMedicationSchema = z.object({
  childId: z.string().uuid(),
  name: z.string().min(1).max(100),
  dose: z.string().max(50).optional(),
  schedule: medicationScheduleSchema,
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  notes: z.string().max(500).optional(),
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

export const createMedicationLogSchema = z.object({
  medicationId: z.string().uuid(),
  date: z.string().date(),
  taken: z.boolean(),
  sideEffects: z.string().max(500).optional(),
});

export const medicationLogSchema = createMedicationLogSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type MedicationSchedule = z.infer<typeof medicationScheduleSchema>;
export type CreateMedication = z.infer<typeof createMedicationSchema>;
export type UpdateMedication = z.infer<typeof updateMedicationSchema>;
export type Medication = z.infer<typeof medicationSchema>;
export type CreateMedicationLog = z.infer<typeof createMedicationLogSchema>;
export type MedicationLog = z.infer<typeof medicationLogSchema>;
