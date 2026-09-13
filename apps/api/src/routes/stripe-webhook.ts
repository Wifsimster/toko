import { Hono } from "hono";
import type Stripe from "stripe";
import { getStripe, getWebhookSecret } from "../lib/stripe";
import { log } from "../lib/safe-logger";
import {
  claimEvent,
  containsDemoIdentifier,
  markProcessed,
} from "../lib/billing/webhook-ledger";
import { STRIPE_WEBHOOK_HANDLERS } from "../lib/billing/webhook-handlers";

/**
 * Stripe webhook — no auth; the signature is the gate. This route owns
 * exactly three things: verify, claim (dedup), dispatch. What each event
 * means lives in lib/billing/webhook-handlers, and the dedup rules in
 * lib/billing/webhook-ledger.
 */
export const stripeWebhookRoute = new Hono();

stripeWebhookRoute.post("/", async (c) => {
  const sig = c.req.header("stripe-signature");
  if (!sig) {
    return c.json(
      { error: "Missing signature", code: "WEBHOOK_MISSING_SIGNATURE" },
      400,
    );
  }

  const rawBody = await c.req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      getWebhookSecret(),
    );
  } catch {
    return c.json(
      { error: "Invalid signature", code: "WEBHOOK_INVALID_SIGNATURE" },
      400,
    );
  }

  // Defensive: never let a forged or misconfigured event touch the demo
  // account's billing row. Issue #103 "Demo seed uses literal
  // demo_subscription".
  if (containsDemoIdentifier(event)) {
    log.warn("stripe_webhook_rejected_demo_identifier", {
      eventId: event.id,
      eventType: event.type,
    });
    return c.json({ received: true, ignored: "demo_identifier" });
  }

  const claim = await claimEvent(event);
  if (claim.status === "duplicate") {
    return c.json({ received: true, duplicate: true });
  }
  if (claim.status === "quarantined") {
    return c.json({ received: true, quarantined: true });
  }

  try {
    await STRIPE_WEBHOOK_HANDLERS[event.type]?.(event);
  } catch (err) {
    log.error("stripe_webhook_failed", {
      eventId: event.id,
      eventType: event.type,
      attempts: claim.attempts,
      status: "failed",
      // Log only the error shape, not the raw Stripe error object, which can
      // carry invoice/customer payload detail.
      error: err instanceof Error ? err.message : String(err),
      errorCode: (err as { code?: string } | undefined)?.code,
      errorType: (err as { type?: string } | undefined)?.type,
    });
    // Leave the ledger row with `processed_at IS NULL` and the bumped
    // `attempts`. Stripe will retry; on the next attempt `attempts`
    // increments again until quarantine kicks in. Crucially we do NOT
    // delete the row — the previous pattern lost the marker entirely if
    // the node crashed between DELETE and the response, disabling the
    // retry-bound forever.
    return c.json(
      { error: "Webhook processing failed", code: "WEBHOOK_PROCESSING_FAILED" },
      500,
    );
  }

  await markProcessed(event);

  // Tagged success log so SREs can compute
  // stripe_webhook_total{event_type, status="success"} from logs.
  log.info("stripe_webhook_event", {
    eventId: event.id,
    eventType: event.type,
    status: "success",
  });
  return c.json({ received: true });
});
