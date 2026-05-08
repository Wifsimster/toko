import { Hono } from "hono";
import { getStripe } from "../lib/stripe";
import { log } from "../lib/safe-logger";

export const healthRoutes = new Hono();

// Cached Stripe-credentials probe. We don't want every healthcheck to fan
// out to Stripe (uptime monitors hit /api/health every 30s; a Stripe call
// per ping would burn 86k requests/day for no useful signal), so we ping
// at most once every 5 minutes and surface the cached verdict on every
// request. The signal we want to catch is: API key was rotated, network
// to Stripe is broken, or our account was suspended — none of which
// resolve in <5 min anyway.
const STRIPE_PING_TTL_MS = 5 * 60_000;
let stripeProbe: { ok: boolean; checkedAt: number; error?: string } = {
  ok: true,
  checkedAt: 0,
};

async function probeStripe(): Promise<void> {
  if (Date.now() - stripeProbe.checkedAt < STRIPE_PING_TTL_MS) return;
  try {
    // balance.retrieve() is the cheapest authenticated read and doesn't
    // require any list permissions; a 401 / 403 / network failure is the
    // signal we're after.
    await getStripe().balance.retrieve();
    stripeProbe = { ok: true, checkedAt: Date.now() };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    stripeProbe = { ok: false, checkedAt: Date.now(), error: message };
    log.warn("stripe_health_probe_failed", { error: message });
  }
}

healthRoutes.get("/", async (c) => {
  // Fire-and-forget so the probe never blocks healthcheck latency. A
  // failed Stripe ping is a signal, not a reason to fail liveness — the
  // uptime monitor still gets a fast 200 with the degraded flag.
  void probeStripe();
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "toko-api",
    stripe: {
      ok: stripeProbe.ok,
      checkedAt:
        stripeProbe.checkedAt === 0
          ? null
          : new Date(stripeProbe.checkedAt).toISOString(),
    },
  });
});
