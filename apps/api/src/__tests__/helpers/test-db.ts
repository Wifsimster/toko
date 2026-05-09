import { sql } from "drizzle-orm";
import { db, migrate } from "@focusflow/db";

// Tables we touch in integration tests, in an order that respects FK
// references. TRUNCATE ... CASCADE means we don't strictly need this, but
// listing them explicitly makes test failures easier to diagnose and
// guards against accidentally wiping a tag table that's been added since.
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

// Lazy migration: only run once per test process. Skips entirely when the
// integration flag isn't set so the unit-test path stays fast and DB-free.
export async function ensureMigrations(): Promise<void> {
  if (!integrationDbAvailable || migrated) return;
  await migrate();
  migrated = true;
}

// Wipe every table the co-parent flows touch. Cheaper than dropping/
// recreating the schema and bullet-proof under FK constraints.
export async function truncateAll(): Promise<void> {
  if (!integrationDbAvailable) return;
  const list = TEST_TABLES.join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`));
}

export { db };
