import { z } from "zod";

const isTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DB_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "DB_ENCRYPTION_KEY must be 64 hex chars (32 bytes)"),
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
    CORS_ORIGIN: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
    STRIPE_PRICE_ID: z.string().min(1, "STRIPE_PRICE_ID is required"),
    GOOGLE_CLIENT_ID: z.string().default("placeholder"),
    GOOGLE_CLIENT_SECRET: z.string().default("placeholder"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3001),
    // Email + cron (all optional; emails gracefully no-op without RESEND_API_KEY)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("Tokō <no-reply@toko.app>"),
    APP_URL: z.string().default("http://localhost:5173"),
    CRON_SECRET: z.string().optional(),
    KOE_IDENTITY_SECRET: z.string().optional(),
    // Business rule C4: subscriptions created before this ISO date get the
    // immutable "founding" cohort tag, locking the original price. Leave
    // empty to disable the founding cohort entirely.
    FOUNDING_COHORT_UNTIL: z.string().optional(),
  })
  .refine(
    (v) => v.NODE_ENV !== "production" || (v.CORS_ORIGIN && v.CORS_ORIGIN.length > 0),
    {
      message: "CORS_ORIGIN is required in production",
      path: ["CORS_ORIGIN"],
    },
  );

const testDefaults: Record<string, string> = {
  DATABASE_URL: "postgres://test:test@localhost:5432/test",
  DB_ENCRYPTION_KEY:
    "0000000000000000000000000000000000000000000000000000000000000001",
  BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
  STRIPE_SECRET_KEY: "sk_test_placeholder",
  STRIPE_WEBHOOK_SECRET: "whsec_test_placeholder",
  STRIPE_PRICE_ID: "price_test_placeholder",
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
  NODE_ENV: "test",
};

export const env = envSchema.parse(
  isTest ? { ...testDefaults, ...process.env } : process.env
);
