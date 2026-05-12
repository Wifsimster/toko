import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Feature-flag catalog: one row per flag key.
//
// `value`    — the default (or globally-forced) resolved value returned when
//              `enabled = false` or `variants` is null.
// `variants` — when set, an array of `{ value, weight }` used for
//              deterministic per-user A/B bucketing. Weights are relative
//              integers (e.g. [50, 50] for a 50/50 split). When null every
//              caller receives `value`.
// `enabled`  — kill switch. When false the API returns `value` regardless of
//              `variants`, with no per-user bucketing performed.
//
// No FK constraints: flags are global configuration, not user-scoped data.
// No indexes: the table is tiny and all reads are point lookups by PK.
export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  variants: jsonb("variants"),
  enabled: boolean("enabled").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
