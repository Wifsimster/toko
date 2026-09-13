import { Hono } from "hono";
import { createHmac } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, user, children, symptoms } from "@focusflow/db";
import type { AppEnv } from "../../types";
import { env } from "../../lib/env";

/** Two small reads the app makes about the account itself. */
export const accountInsightsRoutes = new Hono<AppEnv>();

/**
 * Business rule B5: onboarding ≤ 5 min before first value.
 * Returns the number of minutes between account creation and the
 * earliest child or symptom entry (whichever came first). Null if the
 * parent has logged nothing yet.
 */
accountInsightsRoutes.get("/onboarding-time", async (c) => {
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
accountInsightsRoutes.get("/koe-hash", (c) => {
  const currentUser = c.get("user");
  if (!env.KOE_IDENTITY_SECRET) {
    return c.json({ error: "Koe identity verification not configured" }, 503);
  }
  const hash = createHmac("sha256", env.KOE_IDENTITY_SECRET)
    .update(currentUser.id)
    .digest("hex");
  return c.json({ hash });
});
