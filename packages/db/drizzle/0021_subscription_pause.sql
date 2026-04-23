ALTER TABLE "subscription" ADD COLUMN "paused_until" timestamp;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "pause_months_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "pause_year_ref" integer;