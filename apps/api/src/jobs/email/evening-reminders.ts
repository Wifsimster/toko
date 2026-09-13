import { and, count, eq, inArray } from "drizzle-orm";
import {
  db,
  user,
  userPreferences,
  children,
  journalEntries,
} from "@focusflow/db";
import { sendEmail } from "../../lib/email";
import { unsubscribeHeaders } from "../../lib/unsubscribe";
import { eveningReminderTemplate } from "../../lib/email-templates";
import {
  emptyResult,
  hoursSince,
  localTimeIn,
  todayInTimezone,
  type JobResult,
} from "./shared";

// Sends an evening reminder to users whose local time matches their
// eveningReminderTime, who opted in, and who have not yet logged a journal
// entry for today. Deduplicates via lastEveningReminderAt (20h window).
export async function runEveningReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result = emptyResult();

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      timezone: userPreferences.timezone,
      lastSent: userPreferences.lastEveningReminderAt,
      eveningReminderTime: userPreferences.eveningReminderTime,
    })
    .from(user)
    .innerJoin(userPreferences, eq(userPreferences.userId, user.id))
    .where(eq(userPreferences.eveningReminderOptIn, true));

  for (const row of rows) {
    result.processed++;
    if (localTimeIn(row.timezone, now) !== row.eveningReminderTime) {
      result.skipped++;
      continue;
    }
    // Don't double-send within 20 hours
    if (hoursSince(row.lastSent, now) < 20) {
      result.skipped++;
      continue;
    }

    const localToday = todayInTimezone(row.timezone, now);
    const userChildren = await db
      .select({ id: children.id })
      .from(children)
      .where(eq(children.parentId, row.userId));

    if (userChildren.length === 0) {
      result.skipped++;
      continue;
    }

    const childIds = userChildren.map((c) => c.id);
    const [journalCount] = await db
      .select({ n: count() })
      .from(journalEntries)
      .where(
        and(
          inArray(journalEntries.childId, childIds),
          eq(journalEntries.date, localToday)
        )
      );

    if ((journalCount?.n ?? 0) > 0) {
      result.skipped++;
      continue;
    }

    const { subject, html } = eveningReminderTemplate(row.name);
    const send = await sendEmail({
      to: row.email,
      subject,
      html,
      headers: unsubscribeHeaders(row.userId, "evening"),
    });
    if (send.sent) {
      await db
        .update(userPreferences)
        .set({ lastEveningReminderAt: now, updatedAt: now })
        .where(eq(userPreferences.userId, row.userId));
      result.sent++;
    } else if (send.reason === "error") {
      result.errors++;
    } else {
      // no-api-key — leave lastEveningReminderAt untouched so the user
      // gets their reminder once Resend is configured.
      result.skipped++;
    }
  }

  return result;
}
