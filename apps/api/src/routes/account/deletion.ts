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

export const deletionRoutes = new Hono<AppEnv>();

deletionRoutes.delete("/", async (c) => {
  const currentUser = c.get("user");

  if (!deleteAccountSchema.safeParse(await readJsonBody(c)).success) {
    throw new AppError(
      "CONFIRMATION_REQUIRED",
      'Confirmation requise : envoyez { confirmation: "DELETE" }',
      400,
    );
  }

  await eraseBillingFootprint(currentUser.id);

  await db.delete(user).where(eq(user.id, currentUser.id));

  return c.json({ ok: true });
});

deletionRoutes.post("/schedule-deletion", async (c) => {
  const currentUser = c.get("user");
  await db
    .update(user)
    .set({ deletionScheduledAt: new Date() })
    .where(eq(user.id, currentUser.id));

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

deletionRoutes.post("/cancel-deletion", async (c) => {
  const currentUser = c.get("user");
  await db
    .update(user)
    .set({ deletionScheduledAt: null })
    .where(eq(user.id, currentUser.id));
  return c.json({ scheduled: false });
});

deletionRoutes.get("/deletion-status", async (c) => {
  const currentUser = c.get("user");
  const [row] = await db
    .select({ scheduledAt: user.deletionScheduledAt })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);
  return c.json({ scheduledAt: row?.scheduledAt ?? null });
});
