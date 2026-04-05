CREATE TABLE "medication_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"medication_id" text NOT NULL,
	"date" date NOT NULL,
	"taken" boolean NOT NULL,
	"side_effects" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medication_logs_medication_id_date_unique" UNIQUE("medication_id","date")
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"name" text NOT NULL,
	"dose" text,
	"schedule" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medication_logs_medication_id_idx" ON "medication_logs" USING btree ("medication_id");--> statement-breakpoint
CREATE INDEX "medications_child_id_idx" ON "medications" USING btree ("child_id");