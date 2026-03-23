CREATE TABLE "crisis_items" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"label" text NOT NULL,
	"emoji" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crisis_items" ADD CONSTRAINT "crisis_items_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;