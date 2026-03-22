CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"date" timestamp NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;