import { z } from "zod";

export const consentTypeSchema = z.enum([
  "terms",
  "privacy",
  "ai_usage",
  "research",
  "parental_authority_attestation",
  "co_parent_health_processing",
  // Owner's Art. 9(2)(a) RGPD consent to process their own child's health
  // data, captured when they create the child profile.
  "owner_health_processing",
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
