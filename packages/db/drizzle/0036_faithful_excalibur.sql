CREATE TABLE "routine_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"routine_id" text NOT NULL,
	"step_id" text NOT NULL,
	"child_id" text NOT NULL,
	"date" date NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "routine_completions_step_date_unique" UNIQUE("step_id","date")
);
--> statement-breakpoint
CREATE TABLE "routine_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"routine_id" text NOT NULL,
	"label" text NOT NULL,
	"emoji" text,
	"duration_minutes" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"name" text NOT NULL,
	"emoji" text,
	"time_of_day" text DEFAULT 'morning' NOT NULL,
	"days_of_week" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "routine_completions" ADD CONSTRAINT "routine_completions_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_completions" ADD CONSTRAINT "routine_completions_step_id_routine_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."routine_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_completions" ADD CONSTRAINT "routine_completions_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_steps" ADD CONSTRAINT "routine_steps_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "routine_completions_child_date_idx" ON "routine_completions" USING btree ("child_id","date");--> statement-breakpoint
CREATE INDEX "routine_steps_routine_id_idx" ON "routine_steps" USING btree ("routine_id");--> statement-breakpoint
CREATE INDEX "routines_child_id_idx" ON "routines" USING btree ("child_id");