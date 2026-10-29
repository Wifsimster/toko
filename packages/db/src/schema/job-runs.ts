import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const jobRun = pgTable("job_run", {
  name: text("name").primaryKey(),
  lastStartedAt: timestamp("last_started_at").notNull().defaultNow(),
  lastFinishedAt: timestamp("last_finished_at"),
  lastStatus: text("last_status").notNull().default("running"),
  lastDurationMs: integer("last_duration_ms"),
  lastError: text("last_error"),
  lastResult: jsonb("last_result"),
});
