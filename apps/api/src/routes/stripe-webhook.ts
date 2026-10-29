import { Hono } from "hono";
import type Stripe from "stripe";
import { getStripe, getWebhookSecret } from "../lib/stripe";
import { log } from "../lib/safe-logger";
import {
  claimEvent,
  containsDemoIdentifier,
  markProcessed,
  releaseClaim,
} from "../lib/billing/webhook-ledger";
import { STRIPE_WEBHOOK_HANDLERS } from "../lib/billing/webhook-handlers";

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
  if (claim.status === "in_flight") {
    return c.json(
      { error: "Event already being processed", code: "WEBHOOK_IN_FLIGHT" },
      409,
    );
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
      error: err instanceof Error ? err.message : String(err),
      errorCode: (err as { code?: string } | undefined)?.code,
      errorType: (err as { type?: string } | undefined)?.type,
    });
    await releaseClaim(event).catch(() => undefined);
    return c.json(
      { error: "Webhook processing failed", code: "WEBHOOK_PROCESSING_FAILED" },
      500,
    );
  }

  await markProcessed(event);

  log.info("stripe_webhook_event", {
    eventId: event.id,
    eventType: event.type,
    status: "success",
  });
  return c.json({ received: true });
});
