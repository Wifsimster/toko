import { and, eq, isNull } from "drizzle-orm";
import { db, user } from "@focusflow/db";
import { auth, REMINDER_STEP_HEADER } from "../../lib/auth";
import {
  emptyResult,
  hoursSince,
  localHourIn,
  type JobResult,
} from "./shared";

// Offsets are measured from sign-up, not from the previous reminder, so a
// delayed or skipped run never compounds.
const VERIFICATION_REMINDER_OFFSETS_HOURS = [24, 72, 168] as const;

export async function runVerificationReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result = emptyResult();

  // Daytime-only (Europe/Paris): a 3am sign-up should not trigger a 3am
  // reminder. The whole pass is skipped outside the window — the nudge
  // simply waits for the next daytime tick.
  const hour = localHourIn("Europe/Paris", now);
  if (hour < 9 || hour >= 19) {
    return result;
  }

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      createdAt: user.createdAt,
      remindersSent: user.verificationReminderCount,
      lastReminderAt: user.lastVerificationReminderAt,
    })
    .from(user)
    .where(
      and(
        eq(user.emailVerified, false),
        eq(user.isBlocked, false),
        isNull(user.deletionScheduledAt)
      )
    );

  for (const row of rows) {
    result.processed++;
    const sentCount = row.remindersSent ?? 0;
    if (sentCount >= VERIFICATION_REMINDER_OFFSETS_HOURS.length) {
      // All 3 reminders already sent — we stop here.
      result.skipped++;
      continue;
    }
    const dueAfterHours = VERIFICATION_REMINDER_OFFSETS_HOURS[sentCount]!;
    if (hoursSince(row.createdAt, now) < dueAfterHours) {
      result.skipped++;
      continue;
    }
    // Safety net: never two reminders within 20h, whatever the counter says.
    if (hoursSince(row.lastReminderAt, now) < 20) {
      result.skipped++;
      continue;
    }

    const step = (sentCount + 1) as 1 | 2 | 3;
    try {
      // Re-trigger Better Auth's verification email so the link carries a
      // fresh, valid token. The step header on the passed request makes
      // the auth callback (lib/auth.ts) pick the "relance" template
      // instead of the first-time welcome confirmation — auth.api forwards
      // `request` straight through to that callback.
      await auth.api.sendVerificationEmail({
        body: { email: row.email, callbackURL: "/dashboard" },
        request: new Request("http://localhost", {
          method: "POST",
          headers: { [REMINDER_STEP_HEADER]: String(step) },
        }),
      });
      await db
        .update(user)
        .set({
          verificationReminderCount: step,
          lastVerificationReminderAt: now,
          updatedAt: now,
        })
        .where(eq(user.id, row.userId));
      result.sent++;
    } catch (err) {
      console.error("verification_reminder_send_failed", {
        userId: row.userId,
        step,
        err,
      });
      result.errors++;
    }
  }

  return result;
}
