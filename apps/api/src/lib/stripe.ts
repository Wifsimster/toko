import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export function getPriceId(): string {
  return env.STRIPE_PRICE_ID;
}

export function getWebhookSecret(): string {
  return env.STRIPE_WEBHOOK_SECRET;
}
