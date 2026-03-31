import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export function getPriceId(): string {
  return process.env.STRIPE_PRICE_ID!;
}

export function getWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET!;
}

/**
 * Validate all required Stripe environment variables at startup.
 * Call this before the server starts accepting connections.
 */
export function validateStripeEnv(): void {
  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID",
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement Stripe manquantes : ${missing.join(", ")}`
    );
  }
}
