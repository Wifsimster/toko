import type Stripe from "stripe";
import { and, eq, isNull } from "drizzle-orm";
import { db, subscription, user } from "@focusflow/db";
import { getStripe } from "../stripe";
import { log } from "../safe-logger";
import { sendEmail } from "../email";
import { trialEndingReminderTemplate } from "../email-templates";
import { recordServerEvent } from "../analytics-events";
import {
  intervalFromStripe,
  resolveUserIdFromCustomer,
  upsertSubscriptionFromStripe,
} from "./subscription-sync";

/**
 * What each Stripe event means for us, one function per concern.
 *
 * This was a 140-line `switch` inside the webhook route, so supporting a
 * new event meant editing the same function that owns signature
 * verification, dedup and error handling — and every branch could reach
 * every other branch's locals. Now the route dispatches through
 * STRIPE_WEBHOOK_HANDLERS and never changes; a new event is a new entry.
 */

export type StripeWebhookHandler = (event: Stripe.Event) => Promise<void>;

async function handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  if (!session.client_reference_id) return;
  const userId = session.client_reference_id;

  // Formation one-shot (mode:payment). Only our tagged formation
  // product unlocks content (the Stripe account is shared). Stamp
  // formationPurchasedAt once — the isNull guard makes a Stripe replay
  // idempotent, and the entitlement is permanent thereafter.
  if (session.mode === "payment") {
    if (session.metadata?.product !== "formation") return;
    const stamped = await db
      .update(user)
      .set({ formationPurchasedAt: new Date() })
      .where(
        and(eq(user.id, userId), isNull(user.formationPurchasedAt)),
      )
      .returning({ id: user.id });
    if (stamped.length > 0) {
      await recordServerEvent(userId, "formation_purchased", {
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
      });
    }
    return;
  }

  if (session.mode !== "subscription") return;

  const stripeSub = await getStripe().subscriptions.retrieve(
    session.subscription as string
  );
  await upsertSubscriptionFromStripe(userId, stripeSub, {
    stripeCustomerId: session.customer as string,
  });
  await recordServerEvent(userId, "subscription_started", {
    planId: stripeSub.items.data[0]?.price.id ?? null,
    interval: intervalFromStripe(stripeSub),
    trial: stripeSub.status === "trialing",
  });
  return;
}

async function handleSubscriptionStateChange(
  event: Stripe.Event,
): Promise<void> {
  const payloadSub = event.data.object as Stripe.Subscription;
  const userId = await resolveUserIdFromCustomer(
    payloadSub.customer as string,
  );
  if (!userId) {
    // Unknown customer — most likely a test event from a foreign
    // account or an event for a user that was already deleted.
    // Acking is safe; nothing to update.
    return;
  }
  // The payload is a snapshot from when the event was created; Stripe
  // retries and reorders deliveries, so an old `updated` could land after a
  // newer one. Re-read the subscription so we always write current truth
  // (canceled subscriptions remain retrievable).
  const stripeSub = await getStripe().subscriptions.retrieve(payloadSub.id);
  const applied = await upsertSubscriptionFromStripe(userId, stripeSub);
  if (applied && event.type === "customer.subscription.deleted") {
    const details = (
      stripeSub as unknown as {
        cancellation_details?: { reason?: string | null } | null;
      }
    ).cancellation_details;
    await recordServerEvent(userId, "subscription_canceled", {
      planId: stripeSub.items.data[0]?.price.id ?? null,
      interval: intervalFromStripe(stripeSub),
      reason: details?.reason ?? "unknown",
    });
  }
  return;
}

async function handleTrialWillEnd(event: Stripe.Event): Promise<void> {
  // Fired ~3 days before a trial converts. Send the J-3 reminder
  // email here (event-driven) and stamp `trialReminderSentAt` so
  // the daily cron (`runTrialEndingReminders`) treats this user as
  // already-notified and skips them — keeps both sources idempotent.
  const stripeSub = event.data.object as Stripe.Subscription;
  const userId = await resolveUserIdFromCustomer(
    stripeSub.customer as string,
  );
  if (!userId) return;

  const [row] = await db
    .select({
      email: user.email,
      name: user.name,
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      trialReminderSentAt: subscription.trialReminderSentAt,
    })
    .from(subscription)
    .innerJoin(user, eq(user.id, subscription.userId))
    .where(eq(subscription.userId, userId))
    .limit(1);

  // Only remind for the subscription the row currently tracks — a late
  // event for a replaced subscription must not consume the new one's
  // reminder.
  if (
    !row ||
    row.trialReminderSentAt ||
    row.stripeSubscriptionId !== stripeSub.id
  ) {
    return;
  }

  const tpl = trialEndingReminderTemplate(row.name);
  const send = await sendEmail({
    to: row.email,
    subject: tpl.subject,
    html: tpl.html,
  });
  if (send.sent || send.reason === "no-api-key") {
    // Stamp on successful send OR when email is stubbed in dev:
    // both are terminal, and re-stamping on retry would let Stripe
    // re-trigger forever.
    await db
      .update(subscription)
      .set({ trialReminderSentAt: new Date(), updatedAt: new Date() })
      .where(eq(subscription.id, row.subscriptionId));
  }
  log.info("stripe_trial_will_end", {
    subscriptionId: stripeSub.id,
    trialEnd: stripeSub.trial_end,
    emailSent: send.sent,
  });
  return;
}

async function handleInvoiceSettled(event: Stripe.Event): Promise<void> {
  // A renewal succeeded or failed — the corresponding subscription
  // event will follow, but we proactively refresh the row so the UI
  // reflects the new currentPeriodEnd / past_due status without
  // waiting for the second event. Issue #103 "Missing webhook events".
  const invoice = event.data.object as Stripe.Invoice;
  // Since API version 2025-03-31.basil the subscription lives under
  // `parent.subscription_details`; the top-level field is kept as a
  // fallback for events rendered with an older API version.
  const subRef =
    invoice.parent?.subscription_details?.subscription ??
    (invoice as unknown as { subscription?: string | null }).subscription;
  const stripeSubId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!stripeSubId) return;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;
  const userId = await resolveUserIdFromCustomer(customerId);
  if (!userId) return;
  const stripeSub = await getStripe().subscriptions.retrieve(stripeSubId);
  await upsertSubscriptionFromStripe(userId, stripeSub);
  return;
}

/**
 * Event type → handler. An event with no entry is acknowledged and
 * ignored, which is what Stripe expects for anything we have not opted
 * into.
 */
export const STRIPE_WEBHOOK_HANDLERS: Record<string, StripeWebhookHandler> = {
  "checkout.session.completed": handleCheckoutCompleted,
  "customer.subscription.updated": handleSubscriptionStateChange,
  "customer.subscription.deleted": handleSubscriptionStateChange,
  "customer.subscription.paused": handleSubscriptionStateChange,
  "customer.subscription.resumed": handleSubscriptionStateChange,
  "customer.subscription.trial_will_end": handleTrialWillEnd,
  "invoice.paid": handleInvoiceSettled,
  "invoice.payment_failed": handleInvoiceSettled,
};
