import { z } from "zod";

// Matches the shape returned by PushSubscription.toJSON() in the browser.
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url().min(1).max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
});

export type PushSubscription = z.infer<typeof pushSubscriptionSchema>;
