import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db, jobRun } from "@focusflow/db";
import { getStripe } from "../lib/stripe";
import { log } from "../lib/safe-logger";
import { JOB_DEFS } from "../jobs/job-runner";

export const healthRoutes = new Hono();

const STRIPE_PING_TTL_MS = 5 * 60_000;
let stripeProbe: { ok: boolean; checkedAt: number; error?: string } = {
  ok: true,
  checkedAt: 0,
};

const DB_PING_TTL_MS = 30_000;
let dbProbe: { ok: boolean; checkedAt: number; error?: string } = {
  ok: true,
  checkedAt: 0,
};

async function probeStripe(): Promise<void> {
  if (Date.now() - stripeProbe.checkedAt < STRIPE_PING_TTL_MS) return;
  try {
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
    await db.execute(sql`select 1`);
    dbProbe = { ok: true, checkedAt: Date.now() };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    dbProbe = { ok: false, checkedAt: Date.now(), error: message };
    log.warn("db_health_probe_failed", { error: message });
  }
}

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
  return c.json({ ok, jobs });
});

healthRoutes.get("/", async (c) => {
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
