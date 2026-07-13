import { eq } from "drizzle-orm";
import { db, jobRun } from "@focusflow/db";
import { log } from "../lib/safe-logger";
import {
  runDailyReminders,
  runEveningReminders,
  runTrialEndingReminders,
  runVerificationReminders,
  runWeeklyDigests,
} from "./email-jobs";
import { runPurgeIps } from "./purge-ips";
import { runPurgeScheduledDeletions } from "./purge-scheduled-deletions";
import { runPurgeRetention } from "./purge-retention";

export type JobName =
  | "daily-reminders"
  | "evening-reminders"
  | "weekly-digest"
  | "trial-ending-reminders"
  | "verification-reminders"
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
