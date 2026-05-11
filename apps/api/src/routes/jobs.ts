import { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";
import type { AppEnv } from "../types";
import { env } from "../lib/env";
import { AppError } from "../middleware/error-handler";
import { JOB_DEFS, runJobTracked, type JobName } from "../jobs/job-runner";

export const jobsRoutes = new Hono<AppEnv>();

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

// Protected by CRON_SECRET header. If no secret is set, the endpoints are
// disabled (returns 501) so a misconfigured deploy can't be abused.
jobsRoutes.use("*", async (c, next) => {
  if (!env.CRON_SECRET) {
    throw new AppError(
      "NOT_CONFIGURED",
      "Cron jobs not configured (CRON_SECRET missing)",
      501
    );
  }
  const header = c.req.header("x-cron-secret") ?? "";
  if (!safeEqual(header, env.CRON_SECRET)) {
    throw new AppError("FORBIDDEN", "Invalid cron secret", 403);
  }
  await next();
});

// Every endpoint runs through the same tracked wrapper so /api/health/jobs
// has a last-known state regardless of which trigger invoked the job.
function mountJob(path: string, name: JobName) {
  jobsRoutes.post(path, async (c) => {
    const result = await runJobTracked(JOB_DEFS[name]);
    return c.json(result ?? { ok: true });
  });
}

mountJob("/daily-reminders", "daily-reminders");
mountJob("/evening-reminders", "evening-reminders");
mountJob("/weekly-digest", "weekly-digest");
mountJob("/trial-ending-reminders", "trial-ending-reminders");
mountJob("/purge-ips", "purge-ips");
mountJob("/purge-scheduled-deletions", "purge-scheduled-deletions");
