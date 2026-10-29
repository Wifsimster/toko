import { and, isNotNull, lt } from "drizzle-orm";
import { db, session } from "@focusflow/db";

export async function runPurgeIps(): Promise<{ purged: number }> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await db
    .update(session)
    .set({ ipAddress: null })
    .where(and(isNotNull(session.ipAddress), lt(session.createdAt, cutoff)))
    .returning({ id: session.id });

  return { purged: result.length };
}
