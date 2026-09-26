import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  user,
  children,
  symptoms,
  journalEntries,
  subscription,
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
  barkleyRewards,
  medications,
  medicationLogs,
  crisisItems,
  routines,
  routineSteps,
  routineCompletions,
  parentMoodLogs,
  pushSubscriptions,
  childAccess,
  consents,
  npsResponses,
  userPreferences,
} from "@focusflow/db";
import type { AppEnv } from "../../types";


export const dataExportRoutes = new Hono<AppEnv>();

/**
 * GET /api/account/export
 * Complete personal data export (RGPD Art. 20 — Droit à la portabilité).
 * Returns every category of personal data we hold about the account and its
 * children in structured JSON. Secrets that are not portable personal data
 * (password/2FA secrets, push encryption keys, PIN hashes) are deliberately
 * excluded; the point is to give the user their data, not our credentials.
 */
dataExportRoutes.get("/export", async (c) => {
  const currentUser = c.get("user");

  // Fetch user profile
  const [profile] = await db
    .select({
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, currentUser.id));

  // Fetch all children
  const userChildren = await db
    .select()
    .from(children)
    .where(eq(children.parentId, currentUser.id));

  const childIds = userChildren.map((c) => c.id);

  // Fetch all child-scoped data in parallel
  const [
    allSymptoms,
    allJournal,
    allBarkleySteps,
    allBarkleyBehaviors,
    allBarkleyRewards,
    allMedications,
    allCrisisItems,
    allRoutines,
    allRoutineCompletions,
    allCoParentAccess,
  ] = childIds.length > 0
    ? await Promise.all([
        db.select().from(symptoms).where(inArray(symptoms.childId, childIds)),
        db.select().from(journalEntries).where(inArray(journalEntries.childId, childIds)),
        db.select().from(barkleySteps).where(inArray(barkleySteps.childId, childIds)),
        db.select().from(barkleyBehaviors).where(inArray(barkleyBehaviors.childId, childIds)),
        db.select().from(barkleyRewards).where(inArray(barkleyRewards.childId, childIds)),
        db.select().from(medications).where(inArray(medications.childId, childIds)),
        db.select().from(crisisItems).where(inArray(crisisItems.childId, childIds)),
        db.select().from(routines).where(inArray(routines.childId, childIds)),
        db.select().from(routineCompletions).where(inArray(routineCompletions.childId, childIds)),
        db
          .select({
            childId: childAccess.childId,
            userId: childAccess.userId,
            role: childAccess.role,
            grantedAt: childAccess.grantedAt,
          })
          .from(childAccess)
          .where(inArray(childAccess.childId, childIds)),
      ])
    : [[], [], [], [], [], [], [], [], [], [], [], []];

  // Fetch sub-entity rows keyed off the collections above.
  const behaviorIds = allBarkleyBehaviors.map((b) => b.id);
  const medicationIds = allMedications.map((m) => m.id);
  const routineIds = allRoutines.map((r) => r.id);

  const [allBehaviorLogs, allMedicationLogs, allRoutineSteps] = await Promise.all([
    behaviorIds.length > 0
      ? db.select().from(barkleyBehaviorLogs).where(inArray(barkleyBehaviorLogs.behaviorId, behaviorIds))
      : Promise.resolve([]),
    medicationIds.length > 0
      ? db.select().from(medicationLogs).where(inArray(medicationLogs.medicationId, medicationIds))
      : Promise.resolve([]),
    routineIds.length > 0
      ? db.select().from(routineSteps).where(inArray(routineSteps.routineId, routineIds))
      : Promise.resolve([]),
  ]);

  // Fetch account-scoped data in parallel.
  const [sub, allParentMood, allConsents, allNps, [prefs], allPush] = await Promise.all([
    db
      .select({
        status: subscription.status,
        planId: subscription.planId,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
      })
      .from(subscription)
      .where(eq(subscription.userId, currentUser.id))
      .limit(1)
      .then((rows) => rows[0]),
    db
      .select({ date: parentMoodLogs.date, score: parentMoodLogs.score, note: parentMoodLogs.note, createdAt: parentMoodLogs.createdAt })
      .from(parentMoodLogs)
      .where(eq(parentMoodLogs.userId, currentUser.id)),
    db
      .select({ type: consents.type, version: consents.version, grantedAt: consents.grantedAt, revokedAt: consents.revokedAt })
      .from(consents)
      .where(eq(consents.userId, currentUser.id)),
    db
      .select({ cohort: npsResponses.cohort, score: npsResponses.score, feedback: npsResponses.feedback, submittedAt: npsResponses.submittedAt })
      .from(npsResponses)
      .where(eq(npsResponses.userId, currentUser.id)),
    db
      .select({
        timezone: userPreferences.timezone,
        dailyReminderOptIn: userPreferences.dailyReminderOptIn,
        weeklyDigestOptIn: userPreferences.weeklyDigestOptIn,
        coParentActivityOptIn: userPreferences.coParentActivityOptIn,
        morningReminderTime: userPreferences.morningReminderTime,
        eveningReminderOptIn: userPreferences.eveningReminderOptIn,
        eveningReminderTime: userPreferences.eveningReminderTime,
        formationReminderOptIn: userPreferences.formationReminderOptIn,
        lastFormationReminderAt: userPreferences.lastFormationReminderAt,
        createdAt: userPreferences.createdAt,
        updatedAt: userPreferences.updatedAt,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, currentUser.id))
      .limit(1),
    // Endpoint identifies the device; the p256dh/authKey encryption secrets
    // are intentionally omitted (not portable personal data).
    db
      .select({ endpoint: pushSubscriptions.endpoint, createdAt: pushSubscriptions.createdAt })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, currentUser.id)),
  ]);

  // Structure the export per child
  const childrenExport = userChildren.map((child) => ({
    name: child.name,
    ageRange: child.ageRange,
    gender: child.gender,
    diagnosisType: child.diagnosisType,
    createdAt: child.createdAt,
    symptoms: allSymptoms.filter((s) => s.childId === child.id).map(({ childId, ...rest }) => rest),
    journal: allJournal.filter((j) => j.childId === child.id).map(({ childId, ...rest }) => rest),
    medications: allMedications
      .filter((m) => m.childId === child.id)
      .map(({ childId, id, ...rest }) => ({
        ...rest,
        logs: allMedicationLogs.filter((l) => l.medicationId === id).map(({ medicationId, ...r }) => r),
      })),
    crisisList: allCrisisItems.filter((i) => i.childId === child.id).map(({ childId, ...rest }) => rest),
    routines: allRoutines
      .filter((r) => r.childId === child.id)
      .map(({ childId, id, ...rest }) => ({
        ...rest,
        steps: allRoutineSteps.filter((s) => s.routineId === id).map(({ routineId, ...r }) => r),
        completions: allRoutineCompletions
          .filter((cpl) => cpl.routineId === id)
          .map(({ childId: _cid, routineId, ...r }) => r),
      })),
    barkleySteps: allBarkleySteps.filter((s) => s.childId === child.id).map(({ childId, ...rest }) => rest),
    barkleyBehaviors: allBarkleyBehaviors
      .filter((b) => b.childId === child.id)
      .map((behavior) => ({
        name: behavior.name,
        points: behavior.points,
        icon: behavior.icon,
        active: behavior.active,
        createdAt: behavior.createdAt,
        logs: allBehaviorLogs.filter((l) => l.behaviorId === behavior.id).map(({ behaviorId, ...rest }) => rest),
      })),
    barkleyRewards: allBarkleyRewards.filter((r) => r.childId === child.id).map(({ childId, ...rest }) => rest),
    coParents: allCoParentAccess
      .filter((a) => a.childId === child.id && a.role !== "owner")
      .map(({ childId, ...rest }) => rest),
  }));

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: profile,
    subscription: sub ?? null,
    preferences: prefs ?? null,
    consents: allConsents,
    npsResponses: allNps,
    parentMoodLogs: allParentMood,
    pushSubscriptions: allPush,
    children: childrenExport,
  };

  return c.json(exportData);
});
