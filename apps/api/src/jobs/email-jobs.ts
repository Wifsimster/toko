import { eq, and, gte, lte, isNull, sql, inArray, count } from "drizzle-orm";
import {
  db,
  user,
  userPreferences,
  subscription,
  children,
  symptoms,
  journalEntries,
  barkleyBehaviors,
  barkleyBehaviorLogs,
} from "@focusflow/db";
import { sendEmail } from "../lib/email";
import { auth, REMINDER_STEP_HEADER } from "../lib/auth";
import {
  dailyReminderTemplate,
  eveningReminderTemplate,
  trialEndingReminderTemplate,
  weeklyDigestTemplate,
  type WeeklyDigestData,
} from "../lib/email-templates";
import {
  computeSignals,
  pickSuggestedArticle,
} from "../lib/knowledge-suggestions";
import { toLocalISODate } from "../lib/local-date";

export type JobResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

// Returns the local hour in the given IANA timezone at the current instant.
// Uses Intl.DateTimeFormat so no external dep is needed.
function localHourIn(timezone: string, now: Date = new Date()): number {
  try {
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    }).format(now);
    return Number.parseInt(hourStr, 10);
  } catch {
    // Unknown tz → fall back to UTC
    return now.getUTCHours();
  }
}

// Returns the local time as "HH:mm" in the given IANA timezone.
// Falls back to UTC on invalid timezone.
function localTimeIn(timezone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
}

function localWeekdayIn(timezone: string, now: Date = new Date()): number {
  // Returns 0..6 with 0 = Sunday
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
    }).format(now);
    return (
      { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[fmt] ?? 0
    );
  } catch {
    return now.getUTCDay();
  }
}

// Re-exported under the historical name so callers in this file read
// cleanly. The implementation lives in `lib/local-date.ts` because
// route handlers need it too.
const todayInTimezone = toLocalISODate;

function hoursSince(date: Date | null, now: Date = new Date()): number {
  if (!date) return Number.POSITIVE_INFINITY;
  return (now.getTime() - date.getTime()) / (60 * 60 * 1000);
}

// Sends a daily reminder to users whose local time is 9am, who opted in,
// and who have not yet logged a symptom for today.
// Intended to be invoked by an external cron every 15-60 minutes.
export async function runDailyReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result: JobResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };

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
    const send = await sendEmail({ to: row.email, subject, html });
    if (send.sent) {
      await db
        .update(userPreferences)
        .set({ lastDailyReminderAt: now, updatedAt: now })
        .where(eq(userPreferences.userId, row.userId));
      result.sent++;
    } else if (send.reason === "error") {
      result.errors++;
    } else {
      // no-api-key — leave lastDailyReminderAt untouched so the user
      // gets their reminder once Resend is configured.
      result.skipped++;
    }
  }

  return result;
}

// Sends an evening reminder to users whose local time matches their
// eveningReminderTime, who opted in, and who have not yet logged a journal
// entry for today. Deduplicates via lastEveningReminderAt (20h window).
export async function runEveningReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result: JobResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };

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
    const send = await sendEmail({ to: row.email, subject, html });
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

// Sends a weekly digest on Sunday at 18:00 local time. One email per user
// (covers their first child's stats). Multi-child aggregation is deferred.
export async function runWeeklyDigests(
  now: Date = new Date()
): Promise<JobResult> {
  const result: JobResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };

  const rows = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      timezone: userPreferences.timezone,
      optIn: userPreferences.weeklyDigestOptIn,
      lastSent: userPreferences.lastWeeklyDigestAt,
    })
    .from(user)
    .innerJoin(userPreferences, eq(userPreferences.userId, user.id))
    .where(eq(userPreferences.weeklyDigestOptIn, true));

  for (const row of rows) {
    result.processed++;
    if (localWeekdayIn(row.timezone, now) !== 0) {
      result.skipped++;
      continue;
    }
    if (localHourIn(row.timezone, now) !== 18) {
      result.skipped++;
      continue;
    }
    if (hoursSince(row.lastSent, now) < 6 * 24) {
      result.skipped++;
      continue;
    }

    const [firstChild] = await db
      .select()
      .from(children)
      .where(eq(children.parentId, row.userId))
      .limit(1);
    if (!firstChild) {
      result.skipped++;
      continue;
    }

    const localToday = todayInTimezone(row.timezone, now);
    // Preserves the historical 7-days-back lower bound (a trailing
    // 8-calendar-day window inclusive of today) — only the anchor moves
    // from UTC to the recipient's local day.
    const localTodayDate = new Date(`${localToday}T00:00:00Z`);
    const weekAgoDate = new Date(localTodayDate);
    weekAgoDate.setUTCDate(weekAgoDate.getUTCDate() - 7);
    const weekAgo = weekAgoDate.toISOString().slice(0, 10);

    const weekSymptoms = await db
      .select()
      .from(symptoms)
      .where(
        and(
          eq(symptoms.childId, firstChild.id),
          gte(symptoms.date, weekAgo)
        )
      )
      .orderBy(symptoms.date);

    let moodTrend: "up" | "down" | "stable" | null = null;
    if (weekSymptoms.length >= 4) {
      const half = Math.floor(weekSymptoms.length / 2);
      const firstAvg =
        weekSymptoms.slice(0, half).reduce((s, x) => s + x.mood, 0) / half;
      const secondAvg =
        weekSymptoms.slice(half).reduce((s, x) => s + x.mood, 0) /
        (weekSymptoms.length - half);
      const delta = secondAvg - firstAvg;
      moodTrend = delta > 0.5 ? "up" : delta < -0.5 ? "down" : "stable";
    }

    // 7-day consistency score (mirrors /stats endpoint formula)
    let consistencyScore: number | null = null;
    if (weekSymptoms.length > 0) {
      const uniqueDates = new Set(weekSymptoms.map((s) => s.date));
      const coverage = uniqueDates.size / 7;
      const okDays = weekSymptoms.filter(
        (s) => s.focus >= 6 || s.mood >= 6 || s.agitation <= 4 || s.impulse <= 4
      ).length;
      const stability = okDays / weekSymptoms.length;
      consistencyScore = Math.round(coverage * stability * 100);
    }

    // Weekly stars
    const behaviors = await db
      .select({ id: barkleyBehaviors.id })
      .from(barkleyBehaviors)
      .where(eq(barkleyBehaviors.childId, firstChild.id));
    let weeklyStars = 0;
    if (behaviors.length > 0) {
      const [starsRow] = await db
        .select({ n: count() })
        .from(barkleyBehaviorLogs)
        .where(
          and(
            inArray(
              barkleyBehaviorLogs.behaviorId,
              behaviors.map((b) => b.id)
            ),
            eq(barkleyBehaviorLogs.completed, true),
            gte(barkleyBehaviorLogs.date, weekAgo)
          )
        );
      weeklyStars = starsRow?.n ?? 0;
    }

    // Streak: consecutive days with at least one symptom entry ending today
    const allChildSymptoms = await db
      .select({ date: symptoms.date })
      .from(symptoms)
      .where(eq(symptoms.childId, firstChild.id));
    const symptomDates = new Set(allChildSymptoms.map((s) => s.date));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(localTodayDate);
      checkDate.setUTCDate(checkDate.getUTCDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0]!;
      if (symptomDates.has(dateStr)) streak++;
      else break;
    }

    // Top 3 journal tags this week
    const weekJournals = await db
      .select({ tags: journalEntries.tags })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.childId, firstChild.id),
          gte(journalEntries.date, weekAgo)
        )
      );
    const tagCounts = new Map<string, number>();
    for (const j of weekJournals) {
      if (j.tags && Array.isArray(j.tags)) {
        for (const tag of j.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
      }
    }
    const topTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Best day / hardest day: by average of (mood + focus - agitation - impulse)
    let bestDay: string | null = null;
    let hardestDay: string | null = null;
    if (weekSymptoms.length > 0) {
      const dayScores = new Map<string, { sum: number; count: number }>();
      for (const s of weekSymptoms) {
        const score = s.mood + s.focus - s.agitation - s.impulse;
        const entry = dayScores.get(s.date) ?? { sum: 0, count: 0 };
        entry.sum += score;
        entry.count++;
        dayScores.set(s.date, entry);
      }
      let bestAvg = -Infinity;
      let hardestAvg = Infinity;
      for (const [date, { sum, count: cnt }] of dayScores) {
        const avg = sum / cnt;
        if (avg > bestAvg) { bestAvg = avg; bestDay = date; }
        if (avg < hardestAvg) { hardestAvg = avg; hardestDay = date; }
      }
      // If same day, clear hardest (only one data point)
      if (bestDay === hardestDay) hardestDay = null;
    }

    const signals = computeSignals(weekSymptoms, moodTrend, consistencyScore);
    const featured = pickSuggestedArticle(signals);

    const data: WeeklyDigestData = {
      parentName: row.name,
      childName: firstChild.name,
      consistencyScore,
      moodTrend,
      entriesLogged: weekSymptoms.length,
      weeklyStars,
      streak,
      topTags,
      bestDay,
      hardestDay,
      featuredArticle: featured
        ? { slug: featured.slug, title: featured.title }
        : undefined,
    };

    const { subject, html } = weeklyDigestTemplate(data);
    const send = await sendEmail({ to: row.email, subject, html });
    if (send.sent) {
      await db
        .update(userPreferences)
        .set({ lastWeeklyDigestAt: now, updatedAt: now })
        .where(eq(userPreferences.userId, row.userId));
      result.sent++;
    } else if (send.reason === "error") {
      result.errors++;
    } else {
      // no-api-key — leave lastWeeklyDigestAt untouched so the user
      // gets their digest once Resend is configured.
      result.skipped++;
    }
  }

  // Silence the "sql" import warning if drizzle tree-shakes it
  void sql;
  return result;
}

// Business rule C3 surfacing: send a one-time reminder a couple of days
// before the trial ends so parents can choose (continue / pause / let it
// lapse) without feeling cornered. Idempotent via
// `subscription.trialReminderSentAt`.
// Intended to be invoked by an external cron once per day.
export async function runTrialEndingReminders(
  now: Date = new Date(),
  { daysBefore = 2 }: { daysBefore?: number } = {}
): Promise<JobResult> {
  const result: JobResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };

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

// Email-verification "relance": users who signed up but never confirmed
// their address are nudged up to 3 times — roughly 24h, 3 days and 7 days
// after sign-up — then left alone. The schedule was set with input from
// ADHD-UX, deliverability and activation specialists: a first reminder too
// early reads as spam, while widening gaps (24h → 72h → 168h) keep each
// nudge noticeable without harassing the user.
//
// Idempotent via `user.verificationReminderCount` (which step is next)
// with a 20h `lastVerificationReminderAt` safety window. Offsets are
// measured from sign-up, not from the previous reminder, so a delayed or
// skipped run never compounds. Verified, blocked and deletion-scheduled
// accounts are excluded — verification clears the user from the query,
// and the other two states mean a reminder would be unwelcome.
// Intended to be invoked by an external cron once per hour.
const VERIFICATION_REMINDER_OFFSETS_HOURS = [24, 72, 168] as const;

export async function runVerificationReminders(
  now: Date = new Date()
): Promise<JobResult> {
  const result: JobResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };

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
