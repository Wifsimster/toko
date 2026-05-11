import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

// Observability ledger for scheduled jobs (reminders, digests, purges).
// One row per job *name*, upserted on every run, so the staleness alert in
// /api/health/jobs can answer "did this job run within its expected
// interval?" regardless of which scheduler triggered it (GitHub Actions
// today, in-process node-cron tomorrow).
//
// We intentionally do not store a history — that would be log territory,
// and the safe-logger already emits one structured `job_run` line per
// invocation. This table answers a single question: "what's the last
// known state of this job?". For audit history, parse the logs.
export const jobRun = pgTable("job_run", {
  name: text("name").primaryKey(),
  lastStartedAt: timestamp("last_started_at").notNull().defaultNow(),
  lastFinishedAt: timestamp("last_finished_at"),
  lastStatus: text("last_status").notNull().default("running"),
  lastDurationMs: integer("last_duration_ms"),
  lastError: text("last_error"),
  lastResult: jsonb("last_result"),
});
