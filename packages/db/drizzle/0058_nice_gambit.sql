ALTER TABLE "user" ADD COLUMN "formation_purchased_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "formation_grandfathered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- One-time grandfathering: every account that exists when the Formation
-- offer ships keeps its current Barkley curriculum access, silently and
-- permanently (no-surprises principle for the ADHD audience). Only accounts
-- created AFTER this migration default to false and must buy the formation
-- or hold an active Famille subscription.
UPDATE "user" SET "formation_grandfathered" = true;