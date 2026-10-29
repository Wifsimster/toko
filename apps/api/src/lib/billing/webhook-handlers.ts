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

export type StripeWebhookHandler = (event: Stripe.Event) => Promise<void>;

async function handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  if (!session.client_reference_id) return;
  const userId = session.client_reference_id;

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
    return;
  }
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
  const invoice = event.data.object as Stripe.Invoice;
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
