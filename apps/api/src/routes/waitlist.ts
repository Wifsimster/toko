import { Hono } from "hono";
import type { AppEnv } from "../types";
import { db, waitlistSignups } from "@focusflow/db";
import { joinWaitlistSchema } from "@focusflow/validators";
import { parseBody } from "../lib/http/validate";

export const waitlistRoutes = new Hono<AppEnv>();

// Public waitlist capture (product-strategy Phase 3, "test de demande à coût
// nul"). No auth — anyone can leave an email. The global IP rate limiter on
// /api/* covers abuse; duplicates are ignored so the count stays honest.
waitlistRoutes.post("/", async (c) => {
  const input = await parseBody(c, joinWaitlistSchema);

  await db
    .insert(waitlistSignups)
    .values({
      email: input.email.trim().toLowerCase(),
      source: input.source,
    })
    .onConflictDoNothing({
      target: [waitlistSignups.email, waitlistSignups.source],
    });

  // Always report success — whether the row was new or a duplicate, the user's
  // intent (be on the list) is satisfied, and we don't leak who already signed.
  return c.json({ joined: true });
});
