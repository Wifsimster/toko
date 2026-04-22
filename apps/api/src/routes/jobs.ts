import { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";
import type { AppEnv } from "../types";
import { env } from "../lib/env";
import { AppError } from "../middleware/error-handler";
import { runDailyReminders, runWeeklyDigests } from "../jobs/email-jobs";
import { runPurgeIps } from "../jobs/purge-ips";

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

jobsRoutes.post("/daily-reminders", async (c) => {
  const result = await runDailyReminders();
  return c.json(result);
});

jobsRoutes.post("/weekly-digest", async (c) => {
  const result = await runWeeklyDigests();
  return c.json(result);
});

jobsRoutes.post("/purge-ips", async (c) => {
  const result = await runPurgeIps();
  return c.json(result);
});
