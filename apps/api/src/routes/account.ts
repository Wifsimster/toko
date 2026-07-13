import { createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { Hono } from "hono";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import {
  deleteAccountSchema,
  grantConsentSchema,
  consentTypeSchema,
  submitNpsSchema,
  setLockPinSchema,
  verifyLockPinSchema,
} from "@focusflow/validators";
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
  strengths,
  carePathwayProgress,
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
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getStripe } from "../lib/stripe";
import { rateLimiter } from "../middleware/rate-limiter";
import { env } from "../lib/env";

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.use("*", authMiddleware);

// Account deletion + export are both sensitive: hard-cap per user.
accountRoutes.use(
  "*",
  rateLimiter({
    namespace: "account",
    windowMs: 60 * 60_000,
    limit: 10,
    keyBy: "user",
  }),
);

/**
 * DELETE /api/account
 * Self-service account deletion (RGPD Art. 17 — Droit à l'effacement).
 * Cancels Stripe subscription if active, then deletes the user row.
 * Cascade deletes handle all related data.
 */
accountRoutes.delete("/", async (c) => {
  const currentUser = c.get("user");

  const body = await c.req.json();
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Confirmation requise : envoyez { confirmation: \"DELETE\" }" },
      400
    );
  }

  // Cancel Stripe subscription if one exists, then delete the Stripe
  // Customer — without the latter, the email + name + payment-method PII
  // remain in Stripe indefinitely after the user has been forgotten on
  // our side, breaching RGPD Art. 17 (right to erasure must propagate
  // to processors). Issue #103 "Delete Stripe Customer on account
  // deletion". Done before the DB delete because Customer cancellation
  // is the most likely failure point and we want it to abort the flow
  // (the user can retry) rather than half-delete locally.
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    await getStripe().subscriptions.cancel(sub.stripeSubscriptionId);
  }

  // The Stripe customerId is now persisted on `user` from /checkout-time
  // (PR for #103); fall back to the subscription row for legacy users
  // who subscribed before that change.
  const [profile] = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  const stripeCustomerId =
    profile?.stripeCustomerId ?? sub?.stripeCustomerId ?? null;

  if (stripeCustomerId) {
    try {
      await getStripe().customers.del(stripeCustomerId);
    } catch (err) {
      // A 404 (customer already deleted, e.g. test data) should not
      // block the user's right to erasure on our side. Anything else we
      // do want to surface — re-throw so the request fails loud.
      const code = (err as { statusCode?: number; raw?: { code?: string } })
        .statusCode;
      if (code !== 404) throw err;
    }
  }

  // Delete user — cascade deletes handle all child data
  await db.delete(user).where(eq(user.id, currentUser.id));

  return c.json({ ok: true });
});

/**
 * POST /api/account/schedule-deletion
 * Business rule F3: soft-delete with a 30-day grace period.
 * Marks the account for deletion; the cron job finalizes after 30 days.
 * The user can still log in and call /cancel-deletion to undo.
 */
accountRoutes.post("/schedule-deletion", async (c) => {
  const currentUser = c.get("user");
  await db
    .update(user)
    .set({ deletionScheduledAt: new Date() })
    .where(eq(user.id, currentUser.id));
  return c.json({ scheduled: true });
});

/**
 * POST /api/account/cancel-deletion
 * Aborts a scheduled deletion as long as the 30-day window has not elapsed.
 */
accountRoutes.post("/cancel-deletion", async (c) => {
  const currentUser = c.get("user");
  await db
    .update(user)
    .set({ deletionScheduledAt: null })
    .where(eq(user.id, currentUser.id));
  return c.json({ scheduled: false });
});

/**
 * GET /api/account/deletion-status
 * Returns when (if ever) this account is scheduled for deletion, so the UI
 * can surface the 30-day grace window and a cancel action.
 */
accountRoutes.get("/deletion-status", async (c) => {
  const currentUser = c.get("user");
  const [row] = await db
    .select({ scheduledAt: user.deletionScheduledAt })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  return c.json({ scheduledAt: row?.scheduledAt ?? null });
});

/**
 * Business rule F4: consent management.
 *
 * GET    /api/account/consents          → list the latest non-revoked grant per type
 * POST   /api/account/consents          → record an explicit grant (body: { type, version })
 * DELETE /api/account/consents/:type    → mark the latest grant as revoked
 *
 * Rows are append-only to preserve audit trail; revocation is a timestamp,
 * not a deletion.
 */
accountRoutes.get("/consents", async (c) => {
  const currentUser = c.get("user");
  const rows = await db
    .select()
    .from(consents)
    .where(and(eq(consents.userId, currentUser.id), isNull(consents.revokedAt)))
    .orderBy(desc(consents.grantedAt));

  // Keep only the most recent active grant per type.
  const latestByType = new Map<string, typeof rows[number]>();
  for (const row of rows) {
    if (!latestByType.has(row.type)) latestByType.set(row.type, row);
  }
  return c.json(Array.from(latestByType.values()));
});

accountRoutes.post("/consents", async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json();
  const parsed = grantConsentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  const [row] = await db
    .insert(consents)
    .values({
      userId: currentUser.id,
      type: parsed.data.type,
      version: parsed.data.version,
    })
    .returning();

  return c.json(row, 201);
});

accountRoutes.delete("/consents/:type", async (c) => {
  const currentUser = c.get("user");
  const parsed = consentTypeSchema.safeParse(c.req.param("type"));
  if (!parsed.success) {
    return c.json({ error: "Type de consentement inconnu" }, 400);
  }

  const now = new Date();
  const updated = await db
    .update(consents)
    .set({ revokedAt: now })
    .where(
      and(
        eq(consents.userId, currentUser.id),
        eq(consents.type, parsed.data),
        isNull(consents.revokedAt)
      )
    )
    .returning({ id: consents.id });

  return c.json({ revoked: updated.length });
});

/**
 * Business rule H2: in-app NPS segmented by tenure cohort.
 *
 * GET  /api/account/nps-prompt    → { cohort } that should be prompted now, or null
 * POST /api/account/nps           → record { cohort, score, feedback? } (score null = dismissed)
 *
 * Cohorts unlock at 30 / 90 / 365 days after signup and close when the
 * following cohort opens, so a late-answering user only ever sees the
 * currently-active one.
 */
const NPS_COHORT_WINDOWS: Array<{ cohort: "d30" | "d90" | "d365"; minDays: number; maxDays: number }> = [
  { cohort: "d30", minDays: 30, maxDays: 89 },
  { cohort: "d90", minDays: 90, maxDays: 364 },
  { cohort: "d365", minDays: 365, maxDays: Number.POSITIVE_INFINITY },
];

accountRoutes.get("/nps-prompt", async (c) => {
  const currentUser = c.get("user");

  const [profile] = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  if (!profile) return c.json({ cohort: null });

  const ageDays = Math.floor(
    (Date.now() - profile.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );
  const window = NPS_COHORT_WINDOWS.find(
    (w) => ageDays >= w.minDays && ageDays <= w.maxDays
  );
  if (!window) return c.json({ cohort: null });

  const [existing] = await db
    .select()
    .from(npsResponses)
    .where(
      and(
        eq(npsResponses.userId, currentUser.id),
        eq(npsResponses.cohort, window.cohort)
      )
    )
    .limit(1);

  if (existing) return c.json({ cohort: null });
  return c.json({ cohort: window.cohort });
});

accountRoutes.post("/nps", async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = submitNpsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  const [row] = await db
    .insert(npsResponses)
    .values({
      userId: currentUser.id,
      cohort: parsed.data.cohort,
      score: parsed.data.score,
      feedback: parsed.data.feedback ?? null,
    })
    .onConflictDoNothing({
      target: [npsResponses.userId, npsResponses.cohort],
    })
    .returning();

  return c.json(row ?? { duplicate: true }, row ? 201 : 200);
});

/**
 * GET /api/account/export
 * Complete personal data export (RGPD Art. 20 — Droit à la portabilité).
 * Returns every category of personal data we hold about the account and its
 * children in structured JSON. Secrets that are not portable personal data
 * (password/2FA secrets, push encryption keys, PIN hashes) are deliberately
 * excluded; the point is to give the user their data, not our credentials.
 */
accountRoutes.get("/export", async (c) => {
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
    allStrengths,
    allCarePathway,
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
        db.select().from(strengths).where(inArray(strengths.childId, childIds)),
        db.select().from(carePathwayProgress).where(inArray(carePathwayProgress.childId, childIds)),
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
    strengths: allStrengths.filter((s) => s.childId === child.id).map(({ childId, ...rest }) => rest),
    carePathway: allCarePathway.filter((p) => p.childId === child.id).map(({ childId, ...rest }) => rest),
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

/**
 * Business rule E4: optional PIN to unlock the parent screen.
 *
 * GET    /api/account/lock-pin         → { set: boolean }
 * POST   /api/account/lock-pin         → body { pin } sets/rotates the PIN
 * POST   /api/account/lock-pin/verify  → body { pin } → { ok: boolean }
 * DELETE /api/account/lock-pin         → removes the PIN
 */
function hashPin(pin: string, salt: string): string {
  return createHash("sha256").update(salt + pin).digest("hex");
}

async function getOrCreatePrefs(userId: string) {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  if (row) return row;
  const [created] = await db
    .insert(userPreferences)
    .values({ userId })
    .returning();
  return created!;
}

accountRoutes.get("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  const prefs = await getOrCreatePrefs(currentUser.id);
  return c.json({ set: prefs.lockPinHash !== null });
});

accountRoutes.post("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = setLockPinSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  const salt = randomBytes(16).toString("hex");
  const hash = hashPin(parsed.data.pin, salt);

  await getOrCreatePrefs(currentUser.id);
  await db
    .update(userPreferences)
    .set({ lockPinHash: hash, lockPinSalt: salt, updatedAt: new Date() })
    .where(eq(userPreferences.userId, currentUser.id));

  return c.json({ set: true });
});

accountRoutes.post("/lock-pin/verify", async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = verifyLockPinSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide" }, 422);
  }

  const prefs = await getOrCreatePrefs(currentUser.id);
  if (!prefs.lockPinHash || !prefs.lockPinSalt) {
    return c.json({ ok: false, reason: "no_pin_set" });
  }

  const candidate = hashPin(parsed.data.pin, prefs.lockPinSalt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(prefs.lockPinHash, "hex");
  const ok = a.length === b.length && timingSafeEqual(a, b);

  return c.json({ ok });
});

accountRoutes.delete("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  await getOrCreatePrefs(currentUser.id);
  await db
    .update(userPreferences)
    .set({ lockPinHash: null, lockPinSalt: null, updatedAt: new Date() })
    .where(eq(userPreferences.userId, currentUser.id));
  return c.json({ set: false });
});

/**
 * Business rule B5: onboarding ≤ 5 min before first value.
 * Returns the number of minutes between account creation and the
 * earliest child or symptom entry (whichever came first). Null if the
 * parent has logged nothing yet.
 */
accountRoutes.get("/onboarding-time", async (c) => {
  const currentUser = c.get("user");

  const [profile] = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  if (!profile) return c.json({ firstValueMinutes: null });

  const [firstChild] = await db
    .select({ createdAt: children.createdAt })
    .from(children)
    .where(eq(children.parentId, currentUser.id))
    .orderBy(children.createdAt)
    .limit(1);

  let firstSymptomAt: Date | null = null;
  if (firstChild) {
    const childRows = await db
      .select({ id: children.id })
      .from(children)
      .where(eq(children.parentId, currentUser.id));
    const childIds = childRows.map((r) => r.id);
    if (childIds.length > 0) {
      const [firstSymptom] = await db
        .select({ createdAt: symptoms.createdAt })
        .from(symptoms)
        .where(inArray(symptoms.childId, childIds))
        .orderBy(symptoms.createdAt)
        .limit(1);
      firstSymptomAt = firstSymptom?.createdAt ?? null;
    }
  }

  const firstValue = [firstChild?.createdAt, firstSymptomAt]
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (!firstValue) return c.json({ firstValueMinutes: null });

  const minutes = Math.round(
    (firstValue.getTime() - profile.createdAt.getTime()) / 60_000
  );
  return c.json({ firstValueMinutes: minutes, budgetMinutes: 5 });
});

/**
 * GET /api/account/koe-hash
 * HMAC-SHA256 of the authenticated user id, signed with KOE_IDENTITY_SECRET.
 * Sent to the Koe feedback widget as `userHash` so the koe-server can
 * verify the identity passed from the browser.
 */
accountRoutes.get("/koe-hash", (c) => {
  const currentUser = c.get("user");
  if (!env.KOE_IDENTITY_SECRET) {
    return c.json({ error: "Koe identity verification not configured" }, 503);
  }
  const hash = createHmac("sha256", env.KOE_IDENTITY_SECRET)
    .update(currentUser.id)
    .digest("hex");
  return c.json({ hash });
});
