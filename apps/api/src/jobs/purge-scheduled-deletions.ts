import { and, isNotNull, lt } from "drizzle-orm";
import { db, user } from "@focusflow/db";

// Business rule F3: hard-delete users whose deletion was scheduled more
// than 30 days ago. FK cascades purge children, symptoms, journal,
// medications, barkley data, crisis items, preferences, sessions and
// accounts in a single transaction.
export async function runPurgeScheduledDeletions(): Promise<{ purged: number }> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .delete(user)
    .where(and(isNotNull(user.deletionScheduledAt), lt(user.deletionScheduledAt, cutoff)))
    .returning({ id: user.id });

  return { purged: result.length };
}
