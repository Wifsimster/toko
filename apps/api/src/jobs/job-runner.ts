import { eq, sql } from "drizzle-orm";
import { db, jobRun } from "@focusflow/db";
import { log } from "../lib/safe-logger";
import {
  runDailyReminders,
  runEveningReminders,
  runFormationReminders,
  runTrialEndingReminders,
  runVerificationReminders,
  runWeeklyDigests,
} from "./email";
import { runPurgeIps } from "./purge-ips";
import { runPurgeScheduledDeletions } from "./purge-scheduled-deletions";
import { runPurgeRetention } from "./purge-retention";

export type JobName =
  | "daily-reminders"
  | "evening-reminders"
  | "weekly-digest"
  | "trial-ending-reminders"
  | "verification-reminders"
  | "formation-reminders"
  | "purge-ips"
  | "purge-scheduled-deletions"
  | "purge-retention";

// Single source of truth for "what jobs exist, how often, with what
// implementation". Both the HTTP endpoints in routes/jobs.ts and the
// in-process scheduler (scheduler/index.ts) execute through this registry,
// so adding a new job is one entry here — not three edits across files.
export type JobDef = {
  name: JobName;
  // Cron expression consumed by node-cron when the in-process scheduler
  // is enabled. Kept aligned with .github/workflows/cron.yml so behaviour
  // is identical whether the trigger is external or in-process.
  schedule: string;
  // Expected interval between successful runs, in seconds. /api/health/jobs
  // flags a job as stale when (now - lastFinishedAt) > 2 × this. Catches a
  // silent scheduler regardless of which scheduler is wired up.
  expectedIntervalSeconds: number;
  run: () => Promise<unknown>;
};

export const JOB_DEFS: Record<JobName, JobDef> = {
  "daily-reminders": {
    name: "daily-reminders",
    schedule: "*/5 * * * *",
    expectedIntervalSeconds: 300,
    run: runDailyReminders,
  },
  "evening-reminders": {
    name: "evening-reminders",
    schedule: "*/5 * * * *",
    expectedIntervalSeconds: 300,
    run: runEveningReminders,
  },
  "weekly-digest": {
    name: "weekly-digest",
    schedule: "*/5 * * * *",
    expectedIntervalSeconds: 300,
    run: runWeeklyDigests,
  },
  "trial-ending-reminders": {
    name: "trial-ending-reminders",
    schedule: "0 * * * *",
    expectedIntervalSeconds: 3600,
    run: runTrialEndingReminders,
  },
  "verification-reminders": {
    name: "verification-reminders",
    schedule: "0 * * * *",
    expectedIntervalSeconds: 3600,
    run: runVerificationReminders,
  },
  "formation-reminders": {
    name: "formation-reminders",
    // Toutes les heures : le job ne part qu'à 19 h, heure locale du parent.
    schedule: "0 * * * *",
    expectedIntervalSeconds: 3600,
    run: runFormationReminders,
  },
  "purge-ips": {
    name: "purge-ips",
    schedule: "0 * * * *",
    expectedIntervalSeconds: 3600,
    run: runPurgeIps,
  },
  "purge-scheduled-deletions": {
    name: "purge-scheduled-deletions",
    schedule: "0 * * * *",
    expectedIntervalSeconds: 3600,
    run: runPurgeScheduledDeletions,
  },
  "purge-retention": {
    name: "purge-retention",
    // Daily at 03:15 — retention windows are in months, no need to run often.
    schedule: "15 3 * * *",
    expectedIntervalSeconds: 24 * 3600,
    run: runPurgeRetention,
  },
};

// Wraps a job execution: writes a `running` marker, runs the body, and
// finalises the row with status + duration + result (or error). The row
// is upserted on each invocation so /api/health/jobs always has a
// last-known state — the previous design had no record at all and a
// silently dead scheduler was invisible until users complained.
export async function runJobTracked(def: JobDef): Promise<unknown> {
  const startedAt = new Date();
  const start = performance.now();

  await db
    .insert(jobRun)
    .values({
      name: def.name,
      lastStartedAt: startedAt,
      lastFinishedAt: null,
      lastStatus: "running",
      lastDurationMs: null,
      lastError: null,
      lastResult: null,
    })
    .onConflictDoUpdate({
      target: jobRun.name,
      set: {
        lastStartedAt: startedAt,
        lastFinishedAt: null,
        lastStatus: "running",
        lastDurationMs: null,
        lastError: null,
        lastResult: null,
      },
    });

  try {
    const result = await def.run();
    const durationMs = Math.round(performance.now() - start);
    await db
      .update(jobRun)
      .set({
        lastFinishedAt: new Date(),
        lastStatus: "ok",
        lastDurationMs: durationMs,
        lastResult: (result ?? null) as Record<string, unknown> | null,
      })
      .where(eq(jobRun.name, def.name));
    log.info("job_run_ok", { job: def.name, durationMs, result });
    return result;
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(jobRun)
      .set({
        lastFinishedAt: new Date(),
        lastStatus: "error",
        lastDurationMs: durationMs,
        lastError: message,
      })
      .where(eq(jobRun.name, def.name));
    log.error("job_run_failed", { job: def.name, durationMs, err });
    throw err;
  }
}

// Advisory-lock namespace ("toko" in ASCII, fits 32-bit signed int).
// Namespacing the lock key prevents collisions with any other subsystem
// (e.g. barkley.ts uses single-argument hashtext locks — disjoint here).
const ADVISORY_LOCK_NS = 0x4f4b4f54; // "TOKO"

// FNV-1a 32-bit hash. Stable across deploys so the lock key for
// "daily-reminders" never changes — that's what makes the lock effective
// across replicas and across restarts.
function jobLockKey(name: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Coerce to signed 32-bit so it fits Postgres int4 parameter binding.
  return hash | 0;
}

// Runs a job under a Postgres transactional advisory lock. Shared by the
// in-process scheduler and the HTTP /api/jobs triggers so both can be
// enabled at once without the same tick firing twice (duplicate emails).
// The lock auto-releases at COMMIT so a process crash mid-job cannot
// leave a stale lock the way a session-scoped advisory lock would.
export async function runJobLocked(
  def: JobDef,
): Promise<{ skipped: true } | { skipped: false; result: unknown }> {
  const key = jobLockKey(def.name);
  return db.transaction(async (tx) => {
    const rows = (await tx.execute(
      sql`select pg_try_advisory_xact_lock(${ADVISORY_LOCK_NS}, ${key}) as ok`,
    )) as unknown as Array<{ ok: boolean }>;
    if (!rows[0]?.ok) {
      log.info("job_skip_locked", { job: def.name });
      return { skipped: true as const };
    }
    const result = await runJobTracked(def);
    return { skipped: false as const, result };
  });
}
