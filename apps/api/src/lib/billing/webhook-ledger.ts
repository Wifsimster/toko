import type Stripe from "stripe";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
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

// How long a claim is held before another delivery may take over. Covers a
// node crash mid-handler (the lease is never released) without letting two
// live deliveries overlap. Handlers are a couple of Stripe/DB round trips,
// so a few minutes is generous.
export const WEBHOOK_CLAIM_LEASE_MS = 5 * 60_000;

export type EventClaim =
  | { status: "claim"; attempts: number }
  | { status: "duplicate" }
  | { status: "in_flight" }
  | { status: "quarantined"; attempts: number };

/**
 * Records that we have seen this event and says whether to process it.
 *
 * Contract (mirrored on the schema in
 * packages/db/src/schema/stripe-webhook-events.ts):
 *   1. INSERT (id, event_type, attempts=1, claimed_at=now) ON CONFLICT (id)
 *      DO UPDATE SET attempts = attempts + 1, claimed_at = now
 *      WHERE processed_at IS NULL
 *        AND (claimed_at IS NULL OR claimed_at < now - lease)
 *      RETURNING ...
 *      The conditional update is the exclusive claim: Postgres row-locks the
 *      conflicting row, so of two concurrent deliveries exactly one gets a
 *      row back. The other sees nothing and is told `duplicate` (already
 *      processed) or `in_flight` (another delivery holds a live lease).
 *   2. `markProcessed` once side effects committed, or `releaseClaim` on
 *      failure so Stripe's retry can claim again immediately. A crash
 *      between 1 and 2 leaves the lease to expire.
 */
export async function claimEvent(event: Stripe.Event): Promise<EventClaim> {
  const now = new Date();
  const leaseCutoff = new Date(now.getTime() - WEBHOOK_CLAIM_LEASE_MS);
  const [ledger] = await db
    .insert(stripeWebhookEvent)
    .values({
      id: event.id,
      eventType: event.type,
      attempts: 1,
      claimedAt: now,
    })
    .onConflictDoUpdate({
      target: stripeWebhookEvent.id,
      set: {
        attempts: sql`${stripeWebhookEvent.attempts} + 1`,
        claimedAt: now,
      },
      setWhere: and(
        isNull(stripeWebhookEvent.processedAt),
        or(
          isNull(stripeWebhookEvent.claimedAt),
          lt(stripeWebhookEvent.claimedAt, leaseCutoff),
        ),
      ),
    })
    .returning({ attempts: stripeWebhookEvent.attempts });

  if (!ledger) {
    // Someone else owns this event: find out whether it is done or running.
    const [existing] = await db
      .select({ processedAt: stripeWebhookEvent.processedAt })
      .from(stripeWebhookEvent)
      .where(eq(stripeWebhookEvent.id, event.id))
      .limit(1);
    if (existing && !existing.processedAt) {
      log.info("stripe_webhook_event", {
        eventId: event.id,
        eventType: event.type,
        status: "in_flight",
      });
      return { status: "in_flight" };
    }
    // Tagged log line so SREs can compute
    // stripe_webhook_total{event_type, status="duplicate"} from logs.
    log.info("stripe_webhook_event", {
      eventId: event.id,
      eventType: event.type,
      status: "duplicate",
    });
    return { status: "duplicate" };
  }

  const attempts = ledger.attempts;

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
 * Marks the ledger row processed; future deliveries of the same event id
 * fail the conditional claim and are reported as `duplicate`.
 */
export async function markProcessed(event: Stripe.Event): Promise<void> {
  await db
    .update(stripeWebhookEvent)
    .set({ processedAt: new Date(), claimedAt: null })
    .where(eq(stripeWebhookEvent.id, event.id));
}

/**
 * Drops the processing lease after a handler failure so Stripe's retry can
 * claim the event straight away. `attempts` is kept for quarantine.
 */
export async function releaseClaim(event: Stripe.Event): Promise<void> {
  await db
    .update(stripeWebhookEvent)
    .set({ claimedAt: null })
    .where(
      and(
        eq(stripeWebhookEvent.id, event.id),
        isNull(stripeWebhookEvent.processedAt),
      ),
    );
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
