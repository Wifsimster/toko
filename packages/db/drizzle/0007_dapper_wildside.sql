ALTER TABLE "barkley_rewards" ADD COLUMN "stars_required" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "barkley_rewards" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
-- Grandfather existing rewards as already claimed (starsRequired=0, already unlocked)
UPDATE "barkley_rewards" SET "claimed_at" = NOW() WHERE "claimed_at" IS NULL;