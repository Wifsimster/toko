import { z } from "zod";

export const consentTypeSchema = z.enum([
  "terms",
  "privacy",
  "ai_usage",
  "research",
]);

export const grantConsentSchema = z.object({
  type: consentTypeSchema,
  version: z.string().min(1).max(64),
});

export const consentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: consentTypeSchema,
  version: z.string(),
  grantedAt: z.string().datetime(),
  revokedAt: z.string().datetime().nullable(),
});

export type ConsentType = z.infer<typeof consentTypeSchema>;
export type GrantConsent = z.infer<typeof grantConsentSchema>;
export type Consent = z.infer<typeof consentSchema>;
