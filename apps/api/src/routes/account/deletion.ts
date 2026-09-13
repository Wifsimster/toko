import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, user } from "@focusflow/db";
import type { AppEnv } from "../../types";
import { env } from "../../lib/env";
import { sendEmail } from "../../lib/email";
import { deletionScheduledEmail } from "../../lib/email-templates";
import { formatFrDate } from "../../lib/format/date-fr";
import { readJsonBody } from "../../lib/http/validate";
import { AppError } from "../../middleware/error-handler";
import { deleteAccountSchema } from "@focusflow/validators";
import { eraseBillingFootprint } from "../../lib/account/deletion";

/**
 * Erasure and the 30-day grace window (RGPD Art. 17). The Stripe side of
 * the erasure lives in lib/account/deletion — this file is the HTTP shape
 * of it.
 */
export const deletionRoutes = new Hono<AppEnv>();

/**
 * DELETE /api/account
 * Self-service account deletion (RGPD Art. 17 — Droit à l'effacement).
 * Cancels Stripe subscription if active, then deletes the user row.
 * Cascade deletes handle all related data.
 */
deletionRoutes.delete("/", async (c) => {
  const currentUser = c.get("user");

  // Deliberately a 400 with instructions rather than the generic 422:
  // the parent has to be told exactly what to send to confirm something
  // irreversible. Raised, not returned, so it renders through the one
  // error handler like everything else.
  if (!deleteAccountSchema.safeParse(await readJsonBody(c)).success) {
    throw new AppError(
      "CONFIRMATION_REQUIRED",
      'Confirmation requise : envoyez { confirmation: "DELETE" }',
      400,
    );
  }

  // Erasure must propagate to our processors before we forget the user
  // locally: Stripe holds email, name and payment-method PII. Done first
  // because it is the likeliest failure point, and a failure should abort
  // the flow (the parent can retry) rather than half-delete.
  await eraseBillingFootprint(currentUser.id);

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
deletionRoutes.post("/schedule-deletion", async (c) => {
  const currentUser = c.get("user");
  await db
    .update(user)
    .set({ deletionScheduledAt: new Date() })
    .where(eq(user.id, currentUser.id));

  // Confirm by email so the user has a record and can react if it wasn't them.
  const finalization = formatFrDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );
  const { subject, html } = deletionScheduledEmail({
    name: currentUser.name ?? "",
    date: finalization,
    accountUrl: `${env.APP_URL}/account`,
  });
  void sendEmail({ to: currentUser.email, subject, html });

  return c.json({ scheduled: true });
});

/**
 * POST /api/account/cancel-deletion
 * Aborts a scheduled deletion as long as the 30-day window has not elapsed.
 */
deletionRoutes.post("/cancel-deletion", async (c) => {
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
deletionRoutes.get("/deletion-status", async (c) => {
  const currentUser = c.get("user");
  const [row] = await db
    .select({ scheduledAt: user.deletionScheduledAt })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  return c.json({ scheduledAt: row?.scheduledAt ?? null });
});
