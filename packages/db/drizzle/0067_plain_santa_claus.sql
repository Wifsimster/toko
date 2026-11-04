CREATE TABLE "parent_pauses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"kind" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parent_pauses" ADD CONSTRAINT "parent_pauses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parent_pauses_user_date_idx" ON "parent_pauses" USING btree ("user_id","date");