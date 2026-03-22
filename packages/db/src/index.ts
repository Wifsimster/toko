import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const isProduction = process.env.NODE_ENV === "production";

const client = postgres(connectionString, {
  max: isProduction ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: isProduction ? "require" : false,
});

export const db = drizzle(client, { schema });

export * from "./schema";
export type Database = typeof db;
