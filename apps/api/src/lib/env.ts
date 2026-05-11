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
    // Stripe Billing Portal configuration ID (bpc_…). When set, portal
    // sessions are created with this configuration so the customer can
    // only switch between Tokō Premium prices, not toward products of
    // other apps sharing the same Stripe account. Empty falls back to
    // the account's default configuration.
    STRIPE_PORTAL_CONFIG_ID: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().default("placeholder"),
    GOOGLE_CLIENT_SECRET: z.string().default("placeholder"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3001),
    // Email + cron (all optional; emails gracefully no-op without RESEND_API_KEY)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("Tokō <no-reply@toko.app>"),
    // Recipient for new "Tarif solidaire" requests. Temporary single-inbox
    // routing until proper admin tooling exists.
    SOLIDARITY_NOTIFY_EMAIL: z.string().email().default("battistella@proton.me"),
    APP_URL: z.string().default("http://localhost:5173"),
    CRON_SECRET: z.string().optional(),
    // When true, the API runs an in-process node-cron scheduler that
    // triggers the same job endpoints. Defaults off so that today's
    // GitHub Actions cron keeps working unchanged; flip on per env to
    // migrate away from the external trigger. Both can run in parallel
    // safely — each job is gated by a Postgres advisory lock + the
    // idempotency / dedup logic in the job bodies.
    ENABLE_SCHEDULER: z
      .union([z.literal("true"), z.literal("false")])
      .transform((v) => v === "true")
      .default("false"),
    SCHEDULER_TIMEZONE: z.string().default("Europe/Paris"),
    KOE_IDENTITY_SECRET: z.string().optional(),
    // Web Push VAPID keys (B4). Both optional — without them push fan-out
    // is a no-op and the app still works. Generate via
    // `npx web-push generate-vapid-keys`.
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().default("mailto:no-reply@toko.app"),
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
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
  NODE_ENV: "test",
};

export const env = envSchema.parse(
  isTest ? { ...testDefaults, ...process.env } : process.env
);
