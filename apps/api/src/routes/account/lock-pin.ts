import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";
import {
  removeLockPinSchema,
  setLockPinSchema,
  verifyLockPinSchema,
} from "@focusflow/validators";
import type { AppEnv } from "../../types";
import { parseBody } from "../../lib/http/validate";
import {
  hashPinStrong,
  isLegacyPinHash,
  newPinSalt,
  pinMatches,
} from "../../lib/account/lock-pin";

export const lockPinRoutes = new Hono<AppEnv>();

async function getOrCreatePrefs(userId: string) {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  if (row) return row;
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

  const prefs = await getOrCreatePrefs(currentUser.id);
  if (prefs.lockPinHash && prefs.lockPinSalt) {
    if (
      !input.currentPin ||
      !pinMatches(input.currentPin, prefs.lockPinHash, prefs.lockPinSalt)
    ) {
      return c.json({ error: "INVALID_PIN" }, 403);
    }
  }

  const salt = newPinSalt();
  const hash = hashPinStrong(input.pin, salt);

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

  if (ok && isLegacyPinHash(prefs.lockPinHash)) {
    const salt = newPinSalt();
    await db
      .update(userPreferences)
      .set({
        lockPinHash: hashPinStrong(input.pin, salt),
        lockPinSalt: salt,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, currentUser.id));
  }

  return c.json({ ok });
});

lockPinRoutes.delete("/lock-pin", async (c) => {
  const currentUser = c.get("user");
  const input = await parseBody(c, removeLockPinSchema);
  const prefs = await getOrCreatePrefs(currentUser.id);
  if (!prefs.lockPinHash || !prefs.lockPinSalt) {
    return c.json({ set: false });
  }
  if (!pinMatches(input.currentPin, prefs.lockPinHash, prefs.lockPinSalt)) {
    return c.json({ error: "INVALID_PIN" }, 403);
  }
  await db
    .update(userPreferences)
    .set({ lockPinHash: null, lockPinSalt: null, updatedAt: new Date() })
    .where(eq(userPreferences.userId, currentUser.id));
  return c.json({ set: false });
});
