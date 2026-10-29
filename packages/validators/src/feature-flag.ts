import { z } from "zod";

export const FEATURE_FLAG_KEYS = ["paywall_variant"] as const;

export const featureFlagKeySchema = z.enum(FEATURE_FLAG_KEYS);

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export const variantSchema = z.object({
  value: z.unknown(),
  weight: z.number().int().nonnegative(),
});

export type Variant = z.infer<typeof variantSchema>;

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
