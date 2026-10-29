import { sql } from "drizzle-orm";
import { db, migrate } from "@focusflow/db";

const TEST_TABLES = [
  "audit_log",
  "consents",
  "child_invitations",
  "child_access",
  "children",
  "session",
  '"user"',
] as const;

let migrated = false;

export const integrationDbAvailable = process.env.INTEGRATION_DB === "1";

export async function ensureMigrations(): Promise<void> {
  if (!integrationDbAvailable || migrated) return;
  await migrate();
  migrated = true;
}

export async function truncateAll(): Promise<void> {
  if (!integrationDbAvailable) return;
  const list = TEST_TABLES.join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`));
}

export { db };
