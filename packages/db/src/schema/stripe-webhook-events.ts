import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Stripe-event ledger for at-most-once webhook processing. Stripe retries
// for at least 3 days on non-2xx responses, and out-of-order replays of
// `customer.subscription.updated` could overwrite newer state with stale
// data. The webhook handler INSERTs `(id, event_type)` first; on conflict
// it short-circuits and returns 200 without re-applying the event.
//
// We don't strictly need `event_type` for correctness — `id` alone would
// dedupe — but it's invaluable for the SRE follow-up (per-event-type
// observability counters, see issue #103 P2).
export const stripeWebhookEvent = pgTable("stripe_webhook_event", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});
