ALTER TABLE "user_preferences" ADD COLUMN "morning_reminder_time" text DEFAULT '09:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "evening_reminder_opt_in" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "evening_reminder_time" text DEFAULT '20:30' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "last_evening_reminder_at" timestamp;