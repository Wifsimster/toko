import { drizzle } from "drizzle-orm/postgres-js";
import { migrate as drizzleMigrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const isProduction = process.env.NODE_ENV === "production";

const client = postgres(connectionString, {
  max: isProduction ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: false,
});

export const db = drizzle(client, { schema });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function migrate() {
  console.log("Running database migrations...");
  await drizzleMigrate(db, {
    migrationsFolder: path.resolve(__dirname, "..", "drizzle"),
  });
  console.log("Migrations complete.");
}

export * from "./schema";
export * from "./zod";
export type Database = typeof db;
