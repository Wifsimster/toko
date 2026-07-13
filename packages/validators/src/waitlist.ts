import { z } from "zod";

export const waitlistSourceSchema = z.enum(["android"]);

export const joinWaitlistSchema = z.object({
  email: z.string().email().max(254),
  source: waitlistSourceSchema.default("android"),
});

export type WaitlistSource = z.infer<typeof waitlistSourceSchema>;
export type JoinWaitlist = z.infer<typeof joinWaitlistSchema>;
