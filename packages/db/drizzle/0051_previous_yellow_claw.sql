ALTER TABLE "user" ADD COLUMN "verification_reminder_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_verification_reminder_at" timestamp;