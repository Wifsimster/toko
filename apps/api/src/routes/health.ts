import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "@focusflow/db";
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

// Cached Postgres probe. Same TTL rationale as Stripe — every 30s is
// overkill, and a transient blip in connectivity isn't actionable. The
// previous /api/health only pinged Stripe, so a dead Postgres pool would
// return 200 OK and Traefik / uptime monitors would never alert.
const DB_PING_TTL_MS = 30_000;
let dbProbe: { ok: boolean; checkedAt: number; error?: string } = {
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

async function probeDb(): Promise<void> {
  if (Date.now() - dbProbe.checkedAt < DB_PING_TTL_MS) return;
  try {
    // `SELECT 1` round-trips through the pool without touching any
    // table — catches dead connections, exhausted pool, network blip,
    // or auth failure without coupling the probe to a specific schema.
    await db.execute(sql`select 1`);
    dbProbe = { ok: true, checkedAt: Date.now() };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    dbProbe = { ok: false, checkedAt: Date.now(), error: message };
    log.warn("db_health_probe_failed", { error: message });
  }
}

healthRoutes.get("/", async (c) => {
  // Fire-and-forget so the probes never block healthcheck latency. A
  // failed Stripe / DB ping is a signal, not a reason to fail liveness —
  // the uptime monitor still gets a fast 200 with the degraded flag.
  void probeStripe();
  void probeDb();
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
    db: {
      ok: dbProbe.ok,
      checkedAt:
        dbProbe.checkedAt === 0
          ? null
          : new Date(dbProbe.checkedAt).toISOString(),
    },
  });
});
