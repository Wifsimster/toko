ALTER TABLE "barkley_rewards" ADD COLUMN "times_claimed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "children_parent_id_idx" ON "children" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "symptoms_child_id_date_idx" ON "symptoms" USING btree ("child_id","date");--> statement-breakpoint
CREATE INDEX "journal_entries_child_id_date_idx" ON "journal_entries" USING btree ("child_id","date");--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "barkley_behavior_logs_behavior_id_idx" ON "barkley_behavior_logs" USING btree ("behavior_id");--> statement-breakpoint
CREATE INDEX "barkley_behaviors_child_id_idx" ON "barkley_behaviors" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "barkley_rewards_child_id_idx" ON "barkley_rewards" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "barkley_steps_child_id_idx" ON "barkley_steps" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "crisis_items_child_id_idx" ON "crisis_items" USING btree ("child_id");