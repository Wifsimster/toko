import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import { setLockPinSchema, verifyLockPinSchema } from "@focusflow/validators";
import type { AppEnv } from "../../types";
import { parseBody } from "../../lib/http/validate";
import { hashPin, newPinSalt, pinMatches } from "../../lib/account/lock-pin";


export const lockPinRoutes = new Hono<AppEnv>();

/**
 * Business rule E4: optional PIN to unlock the parent screen.
 *
 * GET    /api/account/lock-pin         → { set: boolean }
 * POST   /api/account/lock-pin         → body { pin } sets/rotates the PIN
 * POST   /api/account/lock-pin/verify  → body { pin } → { ok: boolean }
 * DELETE /api/account/lock-pin         → removes the PIN
 */
async function getOrCreatePrefs(userId: string) {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  if (row) return row;
  // Two concurrent first requests would both miss the row; let the loser's
  // insert no-op instead of raising a unique violation, then re-read.
  await db
    .insert(userPreferences)
    .values({ userId })
    .onConflictDoNothing({ target: userPreferences.userId });
  const [created] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return created!;
}

lockPinRoutes.get("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  const prefs = await getOrCreatePrefs(currentUser.id);
  return c.json({ set: prefs.lockPinHash !== null });
});

lockPinRoutes.post("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, setLockPinSchema);

  const salt = newPinSalt();
  const hash = hashPin(input.pin, salt);

  await getOrCreatePrefs(currentUser.id);
  await db
    .update(userPreferences)
    .set({ lockPinHash: hash, lockPinSalt: salt, updatedAt: new Date() })
    .where(eq(userPreferences.userId, currentUser.id));

  return c.json({ set: true });
});

lockPinRoutes.post("/lock-pin/verify", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, verifyLockPinSchema);

  const prefs = await getOrCreatePrefs(currentUser.id);
  if (!prefs.lockPinHash || !prefs.lockPinSalt) {
    return c.json({ ok: false, reason: "no_pin_set" });
  }

  const ok = pinMatches(input.pin, prefs.lockPinHash, prefs.lockPinSalt);

  return c.json({ ok });
});

lockPinRoutes.delete("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  await getOrCreatePrefs(currentUser.id);
  await db
    .update(userPreferences)
    .set({ lockPinHash: null, lockPinSalt: null, updatedAt: new Date() })
    .where(eq(userPreferences.userId, currentUser.id));
  return c.json({ set: false });
});
