import { and, eq, isNull, like } from "drizzle-orm";
import {
  db,
  user,
  session,
  agentKey,
  passkey,
  pushSubscriptions,
  twoFactor,
  verification,
  childInvitations,
} from "@focusflow/db";

export const recoveryTestHooks: { afterSessionsDeleted?: () => Promise<void> } = {};

export async function secureAccountAfterPasswordReset(
  userId: string,
  { wasEmailVerified }: { wasEmailVerified: boolean },
): Promise<void> {
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.delete(session).where(eq(session.userId, userId));
    await recoveryTestHooks.afterSessionsDeleted?.();
    await tx
      .update(agentKey)
      .set({ revokedAt: now })
      .where(and(eq(agentKey.userId, userId), isNull(agentKey.revokedAt)));
    await tx.delete(passkey).where(eq(passkey.userId, userId));
    await tx
      .delete(verification)
      .where(and(like(verification.identifier, "trust-device-%"), eq(verification.value, userId)));
    await tx.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    await tx
      .delete(childInvitations)
      .where(and(eq(childInvitations.invitedBy, userId), isNull(childInvitations.acceptedAt)));
    if (!wasEmailVerified) {
      await tx.delete(twoFactor).where(eq(twoFactor.userId, userId));
      await tx
        .update(user)
        .set({ emailVerified: true, twoFactorEnabled: false, updatedAt: now })
        .where(eq(user.id, userId));
    }
  });
}
