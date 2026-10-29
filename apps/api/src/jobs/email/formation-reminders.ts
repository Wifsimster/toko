import { count, eq, isNotNull, max } from "drizzle-orm";
import {
  db,
  user,
  userPreferences,
  children,
  barkleySteps,
} from "@focusflow/db";
import { sendEmail } from "../../lib/email";
import { sendPushToUser } from "../../lib/push";
import { getFormationAccess } from "../../lib/premium";
import { unsubscribeHeaders } from "../../lib/unsubscribe";
import { formationReminderTemplate } from "../../lib/email-templates";
import { emptyResult, localHourIn, type JobResult } from "./shared";

export const FORMATION_STEPS = 10;
export const FORMATION_REMINDER_HOUR = 19;
export const FORMATION_REMINDER_GAPS_DAYS = [7, 7, 14] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export type FormationReminderDecision =
  | { send: true; count: number }
  | { send: false; reason: "not-started" | "finished" | "hour" | "too-soon" | "capped" };

export function decideFormationReminder(input: {
  completedCount: number;
  lastCompletedAt: Date | null;
  lastReminderAt: Date | null;
  reminderCount: number;
  localHour: number;
  now: Date;
}): FormationReminderDecision {
  const { completedCount, lastCompletedAt, lastReminderAt, now } = input;
  if (completedCount === 0 || !lastCompletedAt) return { send: false, reason: "not-started" };
  if (completedCount >= FORMATION_STEPS) return { send: false, reason: "finished" };
  if (input.localHour !== FORMATION_REMINDER_HOUR) return { send: false, reason: "hour" };

  const sameBreak = lastReminderAt !== null && lastReminderAt > lastCompletedAt;
  const sent = sameBreak ? input.reminderCount : 0;
  if (sent >= FORMATION_REMINDER_GAPS_DAYS.length) return { send: false, reason: "capped" };

  const since = sent === 0 ? lastCompletedAt : lastReminderAt!;
  const gap = FORMATION_REMINDER_GAPS_DAYS[sent]!;
  if (now.getTime() - since.getTime() < gap * DAY_MS - 60 * 60 * 1000) {
    return { send: false, reason: "too-soon" };
  }
  return { send: true, count: sent + 1 };
}

export async function runFormationReminders(
  now: Date = new Date(),
): Promise<JobResult> {
  const result = emptyResult();

  const progress = await db
    .select({
      userId: children.parentId,
      completed: count(barkleySteps.completedAt),
      lastCompletedAt: max(barkleySteps.completedAt),
    })
    .from(barkleySteps)
    .innerJoin(children, eq(children.id, barkleySteps.childId))
    .where(isNotNull(barkleySteps.completedAt))
    .groupBy(children.id, children.parentId);

  const byUser = new Map<string, (typeof progress)[number]>();
  for (const row of progress) {
    const prev = byUser.get(row.userId);
    if (!prev || (row.lastCompletedAt ?? 0) > (prev.lastCompletedAt ?? 0)) {
      byUser.set(row.userId, row);
    }
  }

  for (const [userId, child] of byUser) {
    result.processed++;
    const [row] = await db
      .select({
        email: user.email,
        name: user.name,
        optIn: userPreferences.formationReminderOptIn,
        timezone: userPreferences.timezone,
        lastReminderAt: userPreferences.lastFormationReminderAt,
        reminderCount: userPreferences.formationReminderCount,
        hasPrefs: userPreferences.userId,
      })
      .from(user)
      .leftJoin(userPreferences, eq(userPreferences.userId, user.id))
      .where(eq(user.id, userId))
      .limit(1);

    if (!row || row.optIn === false) {
      result.skipped++;
      continue;
    }
    const decision = decideFormationReminder({
      completedCount: Number(child.completed),
      lastCompletedAt: child.lastCompletedAt ? new Date(child.lastCompletedAt) : null,
      lastReminderAt: row.lastReminderAt ?? null,
      reminderCount: row.reminderCount ?? 0,
      localHour: localHourIn(row.timezone ?? "Europe/Paris", now),
      now,
    });
    if (!decision.send) {
      result.skipped++;
      continue;
    }
    if (!(await getFormationAccess(userId)).ownsFormation) {
      result.skipped++;
      continue;
    }

    const nextStep = Number(child.completed) + 1;
    const { subject, html } = formationReminderTemplate({
      parentName: row.name,
      nextStep,
      completed: Number(child.completed),
    });
    const send = await sendEmail({
      to: row.email,
      subject,
      html,
      headers: unsubscribeHeaders(userId, "formation"),
    });
    const pushed = await sendPushToUser(userId, {
      title: "Programme Barkley",
      body: `Votre étape ${nextStep} vous attend, à reprendre quand vous voulez.`,
      url: `/barkley/formation/${nextStep}`,
      tag: "formation-reminder",
    });

    if (send.sent || pushed.sent > 0) {
      const values = {
        lastFormationReminderAt: now,
        formationReminderCount: decision.count,
        updatedAt: now,
      };
      if (row.hasPrefs) {
        await db.update(userPreferences).set(values).where(eq(userPreferences.userId, userId));
      } else {
        await db.insert(userPreferences).values({ userId, ...values });
      }
      result.sent++;
    } else if (send.reason === "error") {
      result.errors++;
    } else {
      result.skipped++;
    }
  }

  return result;
}

