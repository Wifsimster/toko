import type Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db, stripeWebhookEvent } from "@focusflow/db";
import { log } from "../safe-logger";

/**
 * Idempotency bookkeeping for Stripe webhooks — a concern entirely
 * separate from what any given event *means*. Keeping it here lets the
 * route read as "claim the event, dispatch it, mark it done" and lets the
 * dedup rules be reasoned about without scrolling past business logic.
 */

// After this many failed processing attempts on the same Stripe event,
// stop returning 500 (which makes Stripe retry for ≥3 days) and instead
// quarantine the event with a 200 ack + warn log. Surfaces as a manual-
// review item in the SRE runbook rather than a PagerDuty storm.
export const MAX_WEBHOOK_ATTEMPTS = 5;

export type EventClaim =
  | { status: "claim"; attempts: number }
  | { status: "duplicate" }
  | { status: "quarantined"; attempts: number };

/**
 * Records that we have seen this event and says whether to process it.
 *
 * Two-phase contract (mirrored on the schema in
 * packages/db/src/schema/stripe-webhook-events.ts):
 *   1. INSERT (id, event_type, attempts=1) ON CONFLICT (id)
 *      DO UPDATE SET attempts = attempts + 1 RETURNING ...
 *      This unconditionally records that we saw the event, even if
 *      the handler later crashes — the previous "delete on failure"
 *      pattern lost the marker if the node was killed between INSERT
 *      and the catch-block DELETE, leaving the event eligible for
 *      processing again with no retry limit.
 *   2. `markProcessed` once side effects committed.
 *
 * Stripe retries any non-2xx response for ≥3 days and routinely
 * re-delivers events even on success during outages, so out-of-order
 * replays of `customer.subscription.updated` could otherwise overwrite
 * newer state with stale data.
 */
export async function claimEvent(event: Stripe.Event): Promise<EventClaim> {
  const [ledger] = await db
    .insert(stripeWebhookEvent)
    .values({ id: event.id, eventType: event.type, attempts: 1 })
    .onConflictDoUpdate({
      target: stripeWebhookEvent.id,
      set: { attempts: sql`${stripeWebhookEvent.attempts} + 1` },
    })
    .returning({
      attempts: stripeWebhookEvent.attempts,
      processedAt: stripeWebhookEvent.processedAt,
    });

  const attempts = ledger?.attempts ?? 1;

  if (ledger?.processedAt) {
    // Tagged log line so SREs can compute
    // stripe_webhook_total{event_type, status="duplicate"} from logs.
    log.info("stripe_webhook_event", {
      eventId: event.id,
      eventType: event.type,
      status: "duplicate",
    });
    return { status: "duplicate" };
  }

  if (attempts > MAX_WEBHOOK_ATTEMPTS) {
    log.warn("stripe_webhook_event", {
      eventId: event.id,
      eventType: event.type,
      attempts,
      status: "quarantined",
    });
    return { status: "quarantined", attempts };
  }

  return { status: "claim", attempts };
}

/**
 * Marks the ledger row processed; future retries of the same event id
 * short-circuit at the `processedAt != null` check in `claimEvent`.
 */
export async function markProcessed(event: Stripe.Event): Promise<void> {
  await db
    .update(stripeWebhookEvent)
    .set({ processedAt: new Date() })
    .where(eq(stripeWebhookEvent.id, event.id));
}

/**
 * True when the Stripe event payload references any identifier prefixed
 * with `demo_` (the seed's literal namespace). The demo seed writes
 * `stripeSubscriptionId = "demo_subscription"`; without this guard a
 * forged or misconfigured webhook carrying that id would mutate the demo
 * account's billing row.
 */
export function containsDemoIdentifier(event: Stripe.Event): boolean {
  if (event.id.startsWith("demo_")) return true;
  const obj = event.data.object as unknown as Record<string, unknown>;
  for (const k of ["id", "customer", "subscription"] as const) {
    const v = obj[k];
    if (typeof v === "string" && v.startsWith("demo_")) return true;
  }
  return false;
}
