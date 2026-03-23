CREATE TABLE "barkley_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "barkley_rewards" ADD CONSTRAINT "barkley_rewards_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;