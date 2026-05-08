CREATE TABLE "child_access" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'co_parent' NOT NULL,
	"granted_by" text,
	"granted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "child_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"invited_email" text NOT NULL,
	"invited_by" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "child_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "child_access" ADD CONSTRAINT "child_access_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_access" ADD CONSTRAINT "child_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_access" ADD CONSTRAINT "child_access_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_invitations" ADD CONSTRAINT "child_invitations_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_invitations" ADD CONSTRAINT "child_invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "child_access_child_user_unique" ON "child_access" USING btree ("child_id","user_id");--> statement-breakpoint
CREATE INDEX "child_access_user_id_idx" ON "child_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "child_access_child_id_idx" ON "child_access" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "child_invitations_child_id_idx" ON "child_invitations" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "child_invitations_email_idx" ON "child_invitations" USING btree ("invited_email");

-- Backfill: every existing child's owner becomes a row in child_access so
-- ownership checks continue to work once routes start reading from this table.
INSERT INTO child_access (id, child_id, user_id, role, granted_by, granted_at)
SELECT gen_random_uuid()::text, id, parent_id, 'owner', parent_id, created_at
FROM children
ON CONFLICT (child_id, user_id) DO NOTHING;