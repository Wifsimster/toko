import { sql } from "drizzle-orm";
import cron, { type ScheduledTask } from "node-cron";
import { db } from "@focusflow/db";
import { log } from "../lib/safe-logger";
import {
  JOB_DEFS,
  runJobTracked,
  type JobDef,
} from "../jobs/job-runner";

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

// Runs a job under a Postgres transactional advisory lock. Today Tokō
// deploys as a single container so the lock is theoretical insurance,
// but the moment `compose.yml` scales to two replicas the same `*/5`
// tick would fire on both — each user would receive two reminder emails.
// The lock auto-releases at COMMIT so a process crash mid-job cannot
// leave a stale lock the way a session-scoped advisory lock would.
async function runWithLock(def: JobDef): Promise<void> {
  const key = jobLockKey(def.name);
  await db.transaction(async (tx) => {
    const rows = (await tx.execute(
      sql`select pg_try_advisory_xact_lock(${ADVISORY_LOCK_NS}, ${key}) as ok`,
    )) as unknown as Array<{ ok: boolean }>;
    if (!rows[0]?.ok) {
      log.info("scheduler_skip_locked", { job: def.name });
      return;
    }
    try {
      await runJobTracked(def);
    } catch {
      // runJobTracked already logged + recorded the failure. Swallow
      // here so a single tick's exception doesn't blow up node-cron's
      // internal task state — the next tick will retry naturally.
    }
  });
}

const tasks: ScheduledTask[] = [];

export function startScheduler(timezone = "Europe/Paris"): void {
  if (tasks.length > 0) {
    log.warn("scheduler_already_started", { tasks: tasks.length });
    return;
  }
  for (const def of Object.values(JOB_DEFS)) {
    const task = cron.schedule(
      def.schedule,
      async () => {
        await runWithLock(def);
      },
      {
        name: def.name,
        timezone,
        // Skip this tick if the previous tick is still running. Belt-
        // and-braces with the advisory lock: catches the single-process
        // overlap case without a round-trip to Postgres.
        noOverlap: true,
      },
    );
    tasks.push(task);
    log.info("scheduler_job_registered", {
      job: def.name,
      schedule: def.schedule,
      timezone,
    });
  }
  log.info("scheduler_started", { jobs: tasks.length });
}

export async function stopScheduler(): Promise<void> {
  await Promise.all(tasks.map((t) => t.stop()));
  tasks.length = 0;
  log.info("scheduler_stopped");
}
