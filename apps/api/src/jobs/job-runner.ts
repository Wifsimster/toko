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

export type JobDef = {
  name: JobName;
  schedule: string;
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
    schedule: "15 3 * * *",
    expectedIntervalSeconds: 24 * 3600,
    run: runPurgeRetention,
  },
};

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

const ADVISORY_LOCK_NS = 0x4f4b4f54;

function jobLockKey(name: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}

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
