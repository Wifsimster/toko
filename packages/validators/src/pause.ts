import { z } from "zod";

export const PAUSE_KINDS = ["souffler"] as const;
export const PAUSE_DURATIONS_MINUTES = [1, 2, 5] as const;

export const pauseKindSchema = z.enum(PAUSE_KINDS);

export const createPauseSchema = z.object({
  kind: pauseKindSchema,
  date: z.string().date(),
  durationSeconds: z.number().int().min(30).max(900),
});

export const gardenDaySchema = z.object({
  date: z.string(),
  leaf: z.boolean(),
});

export const gardenSchema = z.object({
  leaves: z.number().int().min(0),
  today: z.string(),
  week: z.array(gardenDaySchema).length(7),
});

export type PauseKind = z.infer<typeof pauseKindSchema>;
export type CreatePause = z.infer<typeof createPauseSchema>;
export type GardenDay = z.infer<typeof gardenDaySchema>;
export type Garden = z.infer<typeof gardenSchema>;
