import { z } from "zod";

export const EVENT_NAMES = [
  "signup_completed",
  "session_started",
  "paywall_viewed",
  "sos_completed",
  "sos_helpful_rating",
  "trial_started",
  "subscription_started",
  "subscription_canceled",
  "onboarding_resource_opened",
] as const;

export const eventNameSchema = z.enum(EVENT_NAMES);

export const createEventSchema = z.object({
  eventName: eventNameSchema,
  properties: z.record(z.unknown()).optional().default({}),
  sessionId: z
    .string()
    .min(1, "L'identifiant de session est requis")
    .max(200, "L'identifiant de session est trop long"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
