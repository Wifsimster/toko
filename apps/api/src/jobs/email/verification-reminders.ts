import { and, eq, isNull } from "drizzle-orm";
import { db, user } from "@focusflow/db";
import { auth, REMINDER_STEP_HEADER } from "../../lib/auth";
import {
  emptyResult,
  hoursSince,
  localHourIn,
  type JobResult,
} from "./shared";

const VERIFICATION_REMINDER_OFFSETS_HOURS = [24, 72, 168] as const;

export async function runVerificationReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result = emptyResult();

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
      result.skipped++;
      continue;
    }
    const dueAfterHours = VERIFICATION_REMINDER_OFFSETS_HOURS[sentCount]!;
    if (hoursSince(row.createdAt, now) < dueAfterHours) {
      result.skipped++;
      continue;
    }
    if (hoursSince(row.lastReminderAt, now) < 20) {
      result.skipped++;
      continue;
    }

    const step = (sentCount + 1) as 1 | 2 | 3;
    try {
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
