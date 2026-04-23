import { and, isNotNull, lt } from "drizzle-orm";
import { db, session } from "@focusflow/db";

// Business rule A7: IP addresses purged < 24h after capture.
// Better Auth captures ipAddress at session creation, so any session whose
// createdAt is older than 24h must have its ipAddress nulled.
export async function runPurgeIps(): Promise<{ purged: number }> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await db
    .update(session)
    .set({ ipAddress: null })
    .where(and(isNotNull(session.ipAddress), lt(session.createdAt, cutoff)))
    .returning({ id: session.id });

  return { purged: result.length };
}
