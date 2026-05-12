ALTER TABLE "child_invitations" ADD COLUMN "scope" text DEFAULT 'single' NOT NULL;--> statement-breakpoint
ALTER TABLE "child_invitations" ADD COLUMN "batch_id" text;--> statement-breakpoint
CREATE INDEX "child_invitations_batch_id_idx" ON "child_invitations" USING btree ("batch_id");--> statement-breakpoint
DELETE FROM "child_invitations" a
  USING "child_invitations" b
  WHERE a.id <> b.id
    AND a.child_id = b.child_id
    AND lower(a.invited_email) = lower(b.invited_email)
    AND a.accepted_at IS NULL
    AND b.accepted_at IS NULL
    AND a.created_at < b.created_at;--> statement-breakpoint
CREATE UNIQUE INDEX "child_invitations_pending_unique"
  ON "child_invitations" ("child_id", lower("invited_email"))
  WHERE "accepted_at" IS NULL;