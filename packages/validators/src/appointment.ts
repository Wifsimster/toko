import { z } from "zod";

export const appointmentTypeSchema = z.enum([
  "neurologist",
  "speech_therapist",
  "psychologist",
  "school_pap",
  "school_pps",
  "pediatrician",
  "other",
]);

export const createAppointmentSchema = z.object({
  childId: z.string().uuid(),
  title: z.string().min(1).max(200),
  type: appointmentTypeSchema,
  date: z.string().datetime(),
  location: z.string().max(300).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateAppointmentSchema = createAppointmentSchema
  .partial()
  .omit({ childId: true });

export const appointmentSchema = createAppointmentSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AppointmentType = z.infer<typeof appointmentTypeSchema>;
export type CreateAppointment = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
