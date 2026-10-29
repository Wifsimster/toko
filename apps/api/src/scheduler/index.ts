import cron, { type ScheduledTask } from "node-cron";
import { log } from "../lib/safe-logger";
import { JOB_DEFS, runJobLocked, type JobDef } from "../jobs/job-runner";

async function runWithLock(def: JobDef): Promise<void> {
  try {
    await runJobLocked(def);
  } catch {
  }
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
