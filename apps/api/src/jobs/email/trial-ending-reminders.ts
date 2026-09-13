import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { db, user, subscription } from "@focusflow/db";
import { sendEmail } from "../../lib/email";
import { trialEndingReminderTemplate } from "../../lib/email-templates";
import { emptyResult, type JobResult } from "./shared";

// Business rule C3 surfacing: send a one-time reminder a couple of days
// before the trial ends so parents can choose (continue / pause / let it
// lapse) without feeling cornered. Idempotent via
// `subscription.trialReminderSentAt`.
// Intended to be invoked by an external cron once per day.
export async function runTrialEndingReminders(
  now: Date = new Date(),
  { daysBefore = 2 }: { daysBefore?: number } = {}
): Promise<JobResult> {
  const result = emptyResult();

  const windowStart = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + (daysBefore + 1) * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionId: subscription.id,
    })
    .from(subscription)
    .innerJoin(user, eq(user.id, subscription.userId))
    .where(
      and(
        eq(subscription.status, "trialing"),
        gte(subscription.currentPeriodEnd, windowStart),
        lte(subscription.currentPeriodEnd, windowEnd),
        isNull(subscription.trialReminderSentAt)
      )
    );

  for (const row of rows) {
    result.processed++;
    const { subject, html } = trialEndingReminderTemplate(row.name);
    const send = await sendEmail({ to: row.email, subject, html });
    if (send.sent || send.reason === "no-api-key") {
      // Stamp on successful send OR when email is stubbed in dev (no API
      // key): both paths are terminal, and re-stamping on retry would
      // cause the next real cron pass to skip the user.
      await db
        .update(subscription)
        .set({ trialReminderSentAt: now, updatedAt: now })
        .where(eq(subscription.id, row.subscriptionId));
    }
    if (send.sent) result.sent++;
    else if (send.reason === "error") result.errors++;
    else result.skipped++;
  }

  return result;
}
