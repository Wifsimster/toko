CREATE TABLE "barkley_behavior_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"behavior_id" text NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "barkley_behavior_logs_behavior_id_date_unique" UNIQUE("behavior_id","date")
);
--> statement-breakpoint
CREATE TABLE "barkley_behaviors" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"name" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"icon" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barkley_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"step_number" integer NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "barkley_steps_child_id_step_number_unique" UNIQUE("child_id","step_number")
);
--> statement-breakpoint
ALTER TABLE "barkley_behavior_logs" ADD CONSTRAINT "barkley_behavior_logs_behavior_id_barkley_behaviors_id_fk" FOREIGN KEY ("behavior_id") REFERENCES "public"."barkley_behaviors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barkley_behaviors" ADD CONSTRAINT "barkley_behaviors_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barkley_steps" ADD CONSTRAINT "barkley_steps_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;