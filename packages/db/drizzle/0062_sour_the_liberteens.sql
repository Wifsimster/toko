ALTER TABLE "news" DROP CONSTRAINT "news_author_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "push_subscriptions_user_endpoint_unique";--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "barkley_behaviors" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "barkley_rewards" ADD COLUMN "stars_spent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Backfill: preserve stars already spent so balances don't jump.
UPDATE "barkley_rewards" SET "stars_spent" = "stars_required" * "times_claimed";--> statement-breakpoint
ALTER TABLE "barkley_rewards" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "stripe_webhook_event" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- One owner per browser endpoint: keep the most recent row per endpoint.
DELETE FROM "push_subscriptions" a
  USING "push_subscriptions" b
  WHERE a."endpoint" = b."endpoint"
    AND (a."created_at" < b."created_at"
      OR (a."created_at" = b."created_at" AND a."id" < b."id"));--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_unique" ON "push_subscriptions" USING btree ("endpoint");