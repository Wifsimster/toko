CREATE TABLE "solidarity_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"admin_note" text
);
--> statement-breakpoint
ALTER TABLE "solidarity_requests" ADD CONSTRAINT "solidarity_requests_parent_id_user_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "solidarity_requests_parent_id_idx" ON "solidarity_requests" USING btree ("parent_id");