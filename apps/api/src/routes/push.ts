import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { db, pushSubscriptions } from "@focusflow/db";
import { pushSubscriptionSchema } from "@focusflow/validators";
import { env } from "../lib/env";
import { parseBody } from "../lib/http/validate";

export const pushRoutes = new Hono<AppEnv>();

pushRoutes.use("*", authMiddleware);

/**
 * Business rule B4: Web Push subscription management.
 *
 * GET    /api/push/public-key    → VAPID public key for the browser's
 *                                  PushManager.subscribe call, or null
 *                                  when push is not configured server-side
 * POST   /api/push/subscribe     → register a PushSubscription for the
 *                                  current user (idempotent on endpoint;
 *                                  takes the endpoint over from any other
 *                                  user who registered the same browser)
 * DELETE /api/push/subscribe     → remove a single endpoint of the current
 *                                  user; body { endpoint }. The web client
 *                                  calls it on sign-out.
 *
 * Broadcasting is handled out-of-band by the email-jobs-style cron and
 * gated by `isTunnelHourIn(tz)` before fanning out non-critical pushes.
 * VAPID keys live in env (`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`).
 */
pushRoutes.get("/public-key", (c) => {
  return c.json({ publicKey: env.VAPID_PUBLIC_KEY ?? null });
});

pushRoutes.post("/subscribe", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, pushSubscriptionSchema);

  await db
    .insert(pushSubscriptions)
    .values({
      userId: currentUser.id,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      authKey: input.keys.auth,
    })
    // An endpoint identifies one browser and is owned by one user: if another
    // account subscribed this browser before (shared device, sign-out then
    // sign-in), take the row over so that account's pushes stop landing here.
    // Also refreshes the keys when the browser rotated them.
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: currentUser.id,
        p256dh: input.keys.p256dh,
        authKey: input.keys.auth,
      },
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
