import { Hono } from "hono";
import type { AppEnv } from "../types";
import { db, waitlistSignups } from "@focusflow/db";
import { joinWaitlistSchema } from "@focusflow/validators";

export const waitlistRoutes = new Hono<AppEnv>();

// Public waitlist capture (product-strategy Phase 3, "test de demande à coût
// nul"). No auth — anyone can leave an email. The global IP rate limiter on
// /api/* covers abuse; duplicates are ignored so the count stays honest.
waitlistRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = joinWaitlistSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  await db
    .insert(waitlistSignups)
    .values({
      email: parsed.data.email.trim().toLowerCase(),
      source: parsed.data.source,
    })
    .onConflictDoNothing({
      target: [waitlistSignups.email, waitlistSignups.source],
    });

  // Always report success — whether the row was new or a duplicate, the user's
  // intent (be on the list) is satisfied, and we don't leak who already signed.
  return c.json({ joined: true });
});
