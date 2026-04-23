CREATE TABLE "nps_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"cohort" text NOT NULL,
	"score" integer,
	"feedback" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nps_responses" ADD CONSTRAINT "nps_responses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "nps_responses_user_cohort_unique" ON "nps_responses" USING btree ("user_id","cohort");