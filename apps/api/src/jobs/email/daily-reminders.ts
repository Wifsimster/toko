import { and, count, eq, inArray } from "drizzle-orm";
import {
  db,
  user,
  userPreferences,
  children,
  symptoms,
} from "@focusflow/db";
import { sendEmail } from "../../lib/email";
import { unsubscribeHeaders } from "../../lib/unsubscribe";
import { dailyReminderTemplate } from "../../lib/email-templates";
import {
  emptyResult,
  hoursSince,
  localTimeIn,
  todayInTimezone,
  type JobResult,
} from "./shared";

export async function runDailyReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result = emptyResult();

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      timezone: userPreferences.timezone,
      optIn: userPreferences.dailyReminderOptIn,
      lastSent: userPreferences.lastDailyReminderAt,
      morningReminderTime: userPreferences.morningReminderTime,
    })
    .from(user)
    .innerJoin(userPreferences, eq(userPreferences.userId, user.id))
    .where(eq(userPreferences.dailyReminderOptIn, true));

  for (const row of rows) {
    result.processed++;
    if (localTimeIn(row.timezone, now) !== row.morningReminderTime) {
      result.skipped++;
      continue;
    }
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
    const [todayCount] = await db
      .select({ n: count() })
      .from(symptoms)
      .where(
        and(
          inArray(symptoms.childId, childIds),
          eq(symptoms.date, localToday)
        )
      );

    if ((todayCount?.n ?? 0) > 0) {
      result.skipped++;
      continue;
    }

    const { subject, html } = dailyReminderTemplate(row.name);
    const send = await sendEmail({
      to: row.email,
      subject,
      html,
      headers: unsubscribeHeaders(row.userId, "daily"),
    });
    if (send.sent) {
      await db
        .update(userPreferences)
        .set({ lastDailyReminderAt: now, updatedAt: now })
        .where(eq(userPreferences.userId, row.userId));
      result.sent++;
    } else if (send.reason === "error") {
      result.errors++;
    } else {
      result.skipped++;
    }
  }

  return result;
}
