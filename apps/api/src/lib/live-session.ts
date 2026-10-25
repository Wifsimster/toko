import type { Context } from "hono";
import { and, eq } from "drizzle-orm";
import { db, passkey, session } from "@focusflow/db";
import { AppError } from "../middleware/error-handler";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Test-only pause points, to replay races deterministically. Never set in
 * application code.
 */
export const liveSessionTestHooks: { afterSessionLocked?: () => Promise<void> } = {};

/**
 * Runs `fn` in a transaction that first takes a FOR SHARE lock on the
 * request's session row, and refuses (401) if the row is gone.
 *
 * Use it for every route that creates something durable from a session
 * (agent access key, push subscription, co-parent invitation). A password
 * reset deletes the user's session rows first, in its own transaction
 * (lib/account-recovery.ts), then revokes what they created:
 * - the reset's DELETE waits for this lock, so a credential inserted here is
 *   committed before the reset revokes everything, and gets revoked;
 * - once the reset has deleted the row, this lock finds nothing, and the
 *   credential is never created.
 * No interleaving leaves a credential created by a revoked session alive.
 */
export async function withLiveSession<T>(c: Context, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const sessionId = (c.get("session") as { id?: string } | undefined)?.id;
  if (!sessionId) {
    throw new AppError("UNAUTHORIZED", "Session expirée. Reconnectez-vous.", 401);
  }
  return db.transaction(async (tx) => {
    const [live] = await tx
      .select({ id: session.id })
      .from(session)
      .where(eq(session.id, sessionId))
      .for("share");
    if (!live) {
      throw new AppError("UNAUTHORIZED", "Session expirée. Reconnectez-vous.", 401);
    }
    await liveSessionTestHooks.afterSessionLocked?.();
    return fn(tx);
  });
}

/**
 * Passkey registration is a Better Auth endpoint we cannot wrap in
 * withLiveSession, so it is checked right after the insert (auth.ts,
 * hooks.after): if the session that registered the passkey no longer
 * exists, the passkey is deleted. Either the reset ran after the insert
 * (and deleted the passkey itself) or before this check (the session is
 * gone and the passkey goes here): it never survives.
 * Returns true when the passkey was discarded.
 */
export async function discardPasskeyFromRevokedSession({
  sessionId,
  sessionToken,
  passkeyId,
  userId,
}: {
  sessionId?: string | null;
  sessionToken?: string | null;
  passkeyId: string;
  userId: string;
}): Promise<boolean> {
  const where = sessionId
    ? eq(session.id, sessionId)
    : sessionToken
      ? eq(session.token, sessionToken)
      : null;
  const [live] = where
    ? await db.select({ id: session.id }).from(session).where(where).limit(1)
    : [];
  if (live) return false;
  await db.delete(passkey).where(and(eq(passkey.id, passkeyId), eq(passkey.userId, userId)));
  return true;
}
