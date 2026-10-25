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

/**
 * Test-only pause point, to replay the reset/credential race
 * deterministically. Never set in application code.
 */
export const recoveryTestHooks: { afterSessionsDeleted?: () => Promise<void> } = {};

/**
 * Called after every password reset (Better Auth `onPasswordReset`, which
 * runs after the new password is stored and before Better Auth's own
 * session cleanup). A reset is account recovery: whoever held the account
 * before (a forgotten laptop, a leaked password, or someone who
 * pre-registered the parent's address) must not keep any way in.
 *
 * One transaction, in this order:
 * 1. Delete every session row of the user, first. Routes that create a
 *    durable credential lock their session row FOR SHARE in the same
 *    transaction as the insert (lib/live-session.ts): this DELETE waits for
 *    any such insert in flight, and any later one finds no session and is
 *    refused. So nothing created by a revoked session outlives step 2.
 * 2. Revoke or delete what those sessions may have left behind:
 *    - agent access keys (`toko_sk_…`): revoked (soft, keeps the audit
 *      trail). They read the children's health data with no session;
 *    - passkeys: deleted. A passkey signs in without the password;
 *    - "trusted device" records of the 2FA plugin (`verification`
 *      `trust-device-…` → user id): deleted;
 *    - Web Push subscriptions: deleted. They would keep pushing co-parent
 *      activity about the children to someone else's browser;
 *    - pending co-parent invitations sent by this account: deleted. An
 *      invitation is a standing offer of access to a child;
 *    - TOTP 2FA, only when the address was not confirmed before this
 *      reset: nobody had proven the mailbox when it was enrolled. On a
 *      confirmed account 2FA stays: it is what protects the account when
 *      only the mailbox is compromised.
 * 3. Mark the address confirmed: the reset link was opened from the mailbox.
 *
 * Linked Google accounts are kept: Better Auth only links an OAuth account
 * with the same address, i.e. the mailbox owner's.
 */
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
