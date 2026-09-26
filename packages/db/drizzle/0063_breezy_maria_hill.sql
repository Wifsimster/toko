ALTER TABLE "user_preferences" ADD COLUMN "formation_reminder_opt_in" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "last_formation_reminder_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "formation_reminder_count" integer DEFAULT 0 NOT NULL;