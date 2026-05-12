import { z } from "zod";

// Typed catalog of all feature-flag keys. Add new keys here as A/B tests land.
export const FEATURE_FLAG_KEYS = ["paywall_variant"] as const;

export const featureFlagKeySchema = z.enum(FEATURE_FLAG_KEYS);

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

// One entry in the `variants` jsonb array: a candidate value and its relative
// weight used for deterministic per-user bucketing.
export const variantSchema = z.object({
  value: z.unknown(),
  weight: z.number().int().nonnegative(),
});

export type Variant = z.infer<typeof variantSchema>;

// Full row shape — mirrors the `feature_flags` Drizzle table exactly.
export const featureFlagRowSchema = z.object({
  key: featureFlagKeySchema,
  value: z.unknown(),
  variants: z.array(variantSchema).nullable(),
  enabled: z.boolean(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FeatureFlagRow = z.infer<typeof featureFlagRowSchema>;

// Default flag catalog. Seed and API bootstrap read from here so there is
// always a safe fallback even before a migration has run.
export const DEFAULT_FLAGS: Record<
  FeatureFlagKey,
  {
    value: unknown;
    variants?: Array<{ value: unknown; weight: number }>;
    description?: string;
  }
> = {
  paywall_variant: {
    value: "chargeMentale",
    variants: [
      { value: "chargeMentale", weight: 50 },
      { value: "communication", weight: 50 },
    ],
    description:
      "Variante de copie du paywall : Charge Mentale (par défaut) ou Communication (Angle 3).",
  },
};
