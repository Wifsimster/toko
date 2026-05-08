CREATE TABLE "care_pathway_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"step_id" text NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_pathway_progress" ADD CONSTRAINT "care_pathway_progress_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "care_pathway_progress_child_step_idx" ON "care_pathway_progress" USING btree ("child_id","step_id");