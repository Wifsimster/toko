CREATE TABLE "job_run" (
	"name" text PRIMARY KEY NOT NULL,
	"last_started_at" timestamp DEFAULT now() NOT NULL,
	"last_finished_at" timestamp,
	"last_status" text DEFAULT 'running' NOT NULL,
	"last_duration_ms" integer,
	"last_error" text,
	"last_result" jsonb
);
