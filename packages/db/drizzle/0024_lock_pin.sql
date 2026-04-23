ALTER TABLE "user_preferences" ADD COLUMN "lock_pin_hash" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "lock_pin_salt" text;