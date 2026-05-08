CREATE TABLE "strengths" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"emoji" text,
	"occurred_on" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strengths" ADD CONSTRAINT "strengths_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strengths_child_id_occurred_on_idx" ON "strengths" USING btree ("child_id","occurred_on");