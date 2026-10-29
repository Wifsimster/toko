import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const stripeWebhookEvent = pgTable("stripe_webhook_event", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  attempts: integer("attempts").notNull().default(0),
  processedAt: timestamp("processed_at"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
