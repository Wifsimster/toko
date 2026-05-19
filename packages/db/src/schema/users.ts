import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isAdmin: boolean("is_admin").notNull().default(false),
  // Toggled by Better Auth's twoFactor plugin once the user has verified
  // their TOTP setup (POST /two-factor/verify-totp on first enroll). We
  // surface it on the session so the SPA can hide the "Activer" CTA and
  // show the "Désactiver" path instead.
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  // Complimentary premium access granted by an administrator, independent
  // of Stripe. When true the user has full plan access even without (or
  // alongside) a subscription. Toggled only from the admin users console.
  premiumGranted: boolean("premium_granted").notNull().default(false),
  // Set by an administrator from the users console. A blocked user is
  // signed out immediately, can no longer sign in, and loses all access
  // to Tokō until an admin unblocks them. blockedReason is an optional
  // free-text note kept for the admin's own reference.
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockedReason: text("blocked_reason"),
  // Pre-allocated when the user first hits /checkout, so an abandoned
  // checkout doesn't create a new orphan Stripe Customer on retry. The
  // webhook still writes to subscription.stripe_customer_id but this is
  // the source of truth for "does the user already have a Customer?".
  stripeCustomerId: text("stripe_customer_id").unique(),
  // Business rule F3: when a parent requests account deletion, we mark the
  // user here and hard-delete (with cascade) after 30 days. A null value
  // means no deletion is scheduled.
  deletionScheduledAt: timestamp("deletion_scheduled_at"),
  // Email-verification reminder ("relance") tracking. The reminder job
  // sends up to 3 nudges to users who never verified their address, then
  // stops. Count is the number of reminders already sent (0–3); the
  // timestamp is a dedup safety net so a job misfire can't double-send.
  verificationReminderCount: integer("verification_reminder_count")
    .notNull()
    .default(0),
  lastVerificationReminderAt: timestamp("last_verification_reminder_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TOTP secrets + single-use backup codes for Better Auth's twoFactor
// plugin. The secret is stored AES-encrypted with BETTER_AUTH_SECRET, so
// a DB-only breach doesn't yield usable second factors. Cascade-deleted
// with the user so account deletion (Art. 17) takes the 2FA rows with it.
export const twoFactor = pgTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// One row per registered WebAuthn credential (Face ID, Touch ID, security
// key, etc.). `counter` is the authenticator's signature counter — Better
// Auth bumps it on every assertion to detect cloned authenticators.
export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_id").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at").defaultNow(),
  aaguid: text("aaguid"),
});
