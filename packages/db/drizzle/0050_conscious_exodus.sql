CREATE TABLE "companion_discoveries" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"animal_id" text NOT NULL,
	"discovered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companion_discoveries" ADD CONSTRAINT "companion_discoveries_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "companion_discoveries_child_animal_idx" ON "companion_discoveries" USING btree ("child_id","animal_id");