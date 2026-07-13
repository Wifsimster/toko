import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";

// Waitlist signups (product-strategy Phase 3 — "test de demande à coût nul").
// The Android companion app is gated on real demand; this table is the
// signal — the count of emails per source is the first real evidence.
// No account is required (public capture), so no user FK; unique per
// (email, source) so the same person can't inflate the count.
export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    // Which waitlist, e.g. "android". Lets one table serve future waitlists.
    source: text("source").notNull().default("android"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("waitlist_email_source_uniq").on(t.email, t.source)]
);

export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type NewWaitlistSignup = typeof waitlistSignups.$inferInsert;
