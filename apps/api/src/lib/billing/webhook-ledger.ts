import type Stripe from "stripe";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db, stripeWebhookEvent } from "@focusflow/db";
import { log } from "../safe-logger";

export const MAX_WEBHOOK_ATTEMPTS = 5;

export const WEBHOOK_CLAIM_LEASE_MS = 5 * 60_000;

export type EventClaim =
  | { status: "claim"; attempts: number }
  | { status: "duplicate" }
  | { status: "in_flight" }
  | { status: "quarantined"; attempts: number };

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

export async function markProcessed(event: Stripe.Event): Promise<void> {
  await db
    .update(stripeWebhookEvent)
    .set({ processedAt: new Date(), claimedAt: null })
    .where(eq(stripeWebhookEvent.id, event.id));
}

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

export function containsDemoIdentifier(event: Stripe.Event): boolean {
  if (event.id.startsWith("demo_")) return true;
  const obj = event.data.object as unknown as Record<string, unknown>;
  for (const k of ["id", "customer", "subscription"] as const) {
    const v = obj[k];
    if (typeof v === "string" && v.startsWith("demo_")) return true;
  }
  return false;
}
