import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db, jobRun } from "@focusflow/db";
import { getStripe } from "../lib/stripe";
import { log } from "../lib/safe-logger";
import { JOB_DEFS } from "../jobs/job-runner";

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

// Staleness ledger for scheduled jobs. Reports per-job last run + whether
// it has run within 2× its expected interval — the threshold past which
// "the scheduler is silently dead" is the simplest explanation. Used by
// uptime monitors and the planned email-on-staleness alert. Public on
// purpose: the response contains no PII, only job names + durations, and
// making it auth-free means external monitors don't need a session cookie.
healthRoutes.get("/jobs", async (c) => {
  const rows = await db.select().from(jobRun);
  const byName = new Map(rows.map((r) => [r.name, r]));
  const now = Date.now();

  const jobs = Object.values(JOB_DEFS).map((def) => {
    const row = byName.get(def.name);
    const reference = row?.lastFinishedAt ?? row?.lastStartedAt ?? null;
    const ageSeconds = reference
      ? Math.round((now - reference.getTime()) / 1000)
      : null;
    const stale =
      ageSeconds === null || ageSeconds > def.expectedIntervalSeconds * 2;
    return {
      name: def.name,
      expectedIntervalSeconds: def.expectedIntervalSeconds,
      lastStartedAt: row?.lastStartedAt?.toISOString() ?? null,
      lastFinishedAt: row?.lastFinishedAt?.toISOString() ?? null,
      lastStatus: row?.lastStatus ?? "never",
      lastDurationMs: row?.lastDurationMs ?? null,
      lastError: row?.lastError ?? null,
      ageSeconds,
      stale,
    };
  });

  const ok = jobs.every((j) => !j.stale && j.lastStatus !== "error");
  // 200 even when degraded so a single dead job doesn't take the whole
  // healthcheck endpoint down — callers must read `ok` / per-job `stale`.
  return c.json({ ok, jobs });
});

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
