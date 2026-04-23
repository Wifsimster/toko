import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { db, pushSubscriptions } from "@focusflow/db";
import { pushSubscriptionSchema } from "@focusflow/validators";

export const pushRoutes = new Hono<AppEnv>();

pushRoutes.use("*", authMiddleware);

/**
 * Business rule B4: Web Push subscription management.
 *
 * POST   /api/push/subscribe     → register a PushSubscription for the
 *                                  current user (idempotent on endpoint)
 * DELETE /api/push/subscribe     → remove a single endpoint
 *
 * Broadcasting is handled out-of-band by the email-jobs-style cron and
 * gated by `isTunnelHourIn(tz)` before fanning out non-critical pushes.
 * VAPID keys live in env (`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`) and
 * are wired in a follow-up commit.
 */
pushRoutes.post("/subscribe", async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  await db
    .insert(pushSubscriptions)
    .values({
      userId: currentUser.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      authKey: parsed.data.keys.auth,
    })
    .onConflictDoNothing({
      target: [pushSubscriptions.userId, pushSubscriptions.endpoint],
    });

  return c.json({ subscribed: true });
});

pushRoutes.delete("/subscribe", async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : null;
  if (!endpoint) {
    return c.json({ error: "endpoint requis" }, 400);
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, currentUser.id),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  return c.json({ subscribed: false });
});
