import { and, eq, isNull, like } from "drizzle-orm";
import {
  db,
  user,
  agentKey,
  passkey,
  pushSubscriptions,
  twoFactor,
  verification,
} from "@focusflow/db";

/**
 * Called after every password reset (Better Auth `onPasswordReset`). A reset
 * is account recovery: whoever held the account before (a forgotten laptop,
 * a leaked password, or someone who pre-registered the parent's address) must
 * not keep any way in. Better Auth already replaces the password and, with
 * `revokeSessionsOnPasswordReset`, deletes every session. This removes the
 * other ways back in:
 *
 * - agent access keys (`toko_sk_…`): revoked (soft, keeps the audit trail).
 *   They read the children's health data with no session at all.
 * - passkeys: deleted. A passkey signs in without the password.
 * - "trusted device" records of the 2FA plugin: deleted (they live in the
 *   `verification` table as `trust-device-…` → user id).
 * - Web Push subscriptions: deleted. They would keep pushing co-parent
 *   activity about the children to someone else's browser.
 * - TOTP 2FA, only when the address was not confirmed before this reset:
 *   then nobody had proven the mailbox when it was enrolled, so it may be
 *   someone else's authenticator. On a confirmed account 2FA stays: it is
 *   what protects the account when only the mailbox is compromised.
 *
 * Finally the address is marked confirmed: the reset link was opened from
 * the mailbox. Linked Google accounts are kept: Better Auth only links an
 * OAuth account with the same address, i.e. the mailbox owner's.
 */
export async function secureAccountAfterPasswordReset(
  userId: string,
  { wasEmailVerified }: { wasEmailVerified: boolean },
): Promise<void> {
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(agentKey)
      .set({ revokedAt: now })
      .where(and(eq(agentKey.userId, userId), isNull(agentKey.revokedAt)));
    await tx.delete(passkey).where(eq(passkey.userId, userId));
    await tx
      .delete(verification)
      .where(and(like(verification.identifier, "trust-device-%"), eq(verification.value, userId)));
    await tx.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    if (!wasEmailVerified) {
      await tx.delete(twoFactor).where(eq(twoFactor.userId, userId));
      await tx
        .update(user)
        .set({ emailVerified: true, twoFactorEnabled: false, updatedAt: now })
        .where(eq(user.id, userId));
    }
  });
}
