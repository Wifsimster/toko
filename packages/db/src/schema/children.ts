import { pgTable, text, date, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const children = pgTable("children", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthDate: date("birth_date").notNull(),
  gender: text("gender", {
    enum: ["male", "female", "other"],
  }),
  diagnosisType: text("diagnosis_type", {
    enum: ["inattentive", "hyperactive", "mixed", "undefined"],
  }).notNull().default("undefined"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
