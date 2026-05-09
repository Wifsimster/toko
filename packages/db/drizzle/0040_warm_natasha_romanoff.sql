ALTER TABLE "stripe_webhook_event" ALTER COLUMN "processed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "stripe_webhook_event" ALTER COLUMN "processed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_webhook_event" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_webhook_event" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;