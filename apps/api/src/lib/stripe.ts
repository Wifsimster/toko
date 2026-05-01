import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Lookup keys attached to active Stripe prices. Resolved at runtime so the
// same code path works in test + live and a price replacement (new amount,
// same key via `transfer_lookup_key`) does not require an env var change.
// Run `pnpm stripe:setup` to provision the price with the matching key.
export const PRICE_LOOKUP_KEYS = {
  familleMonthly: "toko_famille_monthly",
} as const;

const CACHE_TTL_MS = 5 * 60_000;
const priceIdCache = new Map<string, { id: string; expiresAt: number }>();

export async function resolvePriceId(lookupKey: string): Promise<string> {
  const now = Date.now();
  const cached = priceIdCache.get(lookupKey);
  if (cached && cached.expiresAt > now) {
    return cached.id;
  }

  const { data } = await getStripe().prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });

  const price = data[0];
  if (!price) {
    throw new Error(
      `Stripe price not found for lookup_key="${lookupKey}". Run \`pnpm stripe:setup\` to provision it.`
    );
  }

  priceIdCache.set(lookupKey, { id: price.id, expiresAt: now + CACHE_TTL_MS });
  return price.id;
}

export function getWebhookSecret(): string {
  return env.STRIPE_WEBHOOK_SECRET;
}
