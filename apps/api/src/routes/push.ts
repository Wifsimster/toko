import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { db, pushSubscriptions } from "@focusflow/db";
import { pushSubscriptionSchema } from "@focusflow/validators";
import { env } from "../lib/env";
import { parseBody } from "../lib/http/validate";
import { withLiveSession } from "../lib/live-session";

export const pushRoutes = new Hono<AppEnv>();

pushRoutes.use("*", authMiddleware);

pushRoutes.get("/public-key", (c) => {
  return c.json({ publicKey: env.VAPID_PUBLIC_KEY ?? null });
});

pushRoutes.post("/subscribe", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, pushSubscriptionSchema);

  await withLiveSession(c, (tx) => tx
    .insert(pushSubscriptions)
    .values({
      userId: currentUser.id,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      authKey: input.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: currentUser.id,
        p256dh: input.keys.p256dh,
        authKey: input.keys.auth,
      },
    }));

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
