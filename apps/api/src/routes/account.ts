import { Hono } from "hono";
import Stripe from "stripe";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { deleteAccountSchema } from "@focusflow/validators";
import {
  db,
  user,
  children,
  symptoms,
  medication,
  medicationLogs,
  journalEntries,
  subscription,
  barkleySteps,
  barkleyBehaviors,
  barkleyBehaviorLogs,
} from "@focusflow/db";
import { eq, inArray } from "drizzle-orm";

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.use("*", authMiddleware);

let _stripe: Stripe | undefined;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

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

  // Cancel Stripe subscription if one exists (must happen before DB deletion)
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    await getStripe().subscriptions.cancel(sub.stripeSubscriptionId);
  }

  // Delete user — cascade deletes handle all child data
  await db.delete(user).where(eq(user.id, currentUser.id));

  return c.json({ ok: true });
});

/**
 * GET /api/account/export
 * Complete personal data export (RGPD Art. 20 — Droit à la portabilité).
 * Returns all user data in structured JSON format.
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

  // Fetch all child-related data in parallel
  const [
    allSymptoms,
    allMedications,
    allJournal,
    allBarkleySteps,
    allBarkleyBehaviors,
  ] = childIds.length > 0
    ? await Promise.all([
        db
          .select()
          .from(symptoms)
          .where(inArray(symptoms.childId, childIds)),
        db
          .select()
          .from(medication)
          .where(inArray(medication.childId, childIds)),
        db
          .select()
          .from(journalEntries)
          .where(inArray(journalEntries.childId, childIds)),
        db
          .select()
          .from(barkleySteps)
          .where(inArray(barkleySteps.childId, childIds)),
        db
          .select()
          .from(barkleyBehaviors)
          .where(inArray(barkleyBehaviors.childId, childIds)),
      ])
    : [[], [], [], [], []];

  // Fetch medication logs and barkley behavior logs
  const medIds = allMedications.map((m) => m.id);
  const behaviorIds = allBarkleyBehaviors.map((b) => b.id);

  const [allMedLogs, allBehaviorLogs] = await Promise.all([
    medIds.length > 0
      ? db
          .select()
          .from(medicationLogs)
          .where(inArray(medicationLogs.medicationId, medIds))
      : Promise.resolve([]),
    behaviorIds.length > 0
      ? db
          .select()
          .from(barkleyBehaviorLogs)
          .where(inArray(barkleyBehaviorLogs.behaviorId, behaviorIds))
      : Promise.resolve([]),
  ]);

  // Fetch subscription info
  const [sub] = await db
    .select({
      status: subscription.status,
      planId: subscription.planId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      createdAt: subscription.createdAt,
    })
    .from(subscription)
    .where(eq(subscription.userId, currentUser.id))
    .limit(1);

  // Structure the export per child
  const childrenExport = userChildren.map((child) => ({
    name: child.name,
    birthDate: child.birthDate,
    diagnosisType: child.diagnosisType,
    createdAt: child.createdAt,
    symptoms: allSymptoms
      .filter((s) => s.childId === child.id)
      .map(({ childId, ...rest }) => rest),
    medications: allMedications
      .filter((m) => m.childId === child.id)
      .map((med) => ({
        name: med.name,
        dose: med.dose,
        scheduledAt: med.scheduledAt,
        active: med.active,
        createdAt: med.createdAt,
        logs: allMedLogs
          .filter((l) => l.medicationId === med.id)
          .map(({ medicationId, ...rest }) => rest),
      })),
    journal: allJournal
      .filter((j) => j.childId === child.id)
      .map(({ childId, ...rest }) => rest),
    barkleySteps: allBarkleySteps
      .filter((s) => s.childId === child.id)
      .map(({ childId, ...rest }) => rest),
    barkleyBehaviors: allBarkleyBehaviors
      .filter((b) => b.childId === child.id)
      .map((behavior) => ({
        name: behavior.name,
        points: behavior.points,
        icon: behavior.icon,
        active: behavior.active,
        createdAt: behavior.createdAt,
        logs: allBehaviorLogs
          .filter((l) => l.behaviorId === behavior.id)
          .map(({ behaviorId, ...rest }) => rest),
      })),
  }));

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: profile,
    subscription: sub ?? null,
    children: childrenExport,
  };

  return c.json(exportData);
});
