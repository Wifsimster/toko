import type { Context } from "hono";
import { and, eq } from "drizzle-orm";
import { db, passkey, session } from "@focusflow/db";
import { AppError } from "../middleware/error-handler";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const liveSessionTestHooks: { afterSessionLocked?: () => Promise<void> } = {};

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
