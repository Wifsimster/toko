import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

// Stripe-event ledger for at-most-once webhook processing. Stripe retries
// for at least 3 days on non-2xx responses, and out-of-order replays of
// `customer.subscription.updated` could overwrite newer state with stale
// data.
//
// Two-phase contract:
//   1. INSERT (id, event_type, attempts=1) ON CONFLICT (id) DO UPDATE
//      SET attempts = attempts + 1. The row exists unconditionally after
//      this step, even if the handler later crashes — that's what makes
//      the ledger crash-safe (the previous "delete on failure" pattern
//      lost the marker if the node was killed mid-handler).
//   2. UPDATE processed_at = NOW() once the handler has applied its side
//      effects. A row with `processed_at IS NULL` is therefore a known
//      in-flight or failed event.
//
// `attempts` lets us quarantine poison events: after N failed retries we
// log + ack 200 instead of returning 500 forever, killing the PagerDuty
// storm a malformed payload would otherwise cause.
export const stripeWebhookEvent = pgTable("stripe_webhook_event", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  attempts: integer("attempts").notNull().default(0),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
