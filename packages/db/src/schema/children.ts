import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./users";

export const children = pgTable("children", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ageRange: text("age_range", {
    enum: ["0-5", "6-8", "9-11", "12-14", "15-17"],
  }).notNull(),
  gender: text("gender", {
    enum: ["male", "female", "other"],
  }),
  diagnosisType: text("diagnosis_type", {
    enum: ["inattentive", "hyperactive", "mixed", "undefined"],
  }).notNull().default("undefined"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("children_parent_id_idx").on(t.parentId)]);
