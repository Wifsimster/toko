CREATE TABLE "admin_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"content" "bytea" NOT NULL,
	"occurred_on" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_documents" ADD CONSTRAINT "admin_documents_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_documents_child_id_idx" ON "admin_documents" USING btree ("child_id");