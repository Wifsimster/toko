import { Hono } from "hono";
import type { AppEnv } from "../types";
import { db, waitlistSignups } from "@focusflow/db";
import { joinWaitlistSchema } from "@focusflow/validators";
import { parseBody } from "../lib/http/validate";
import { rateLimiter } from "../middleware/rate-limiter";

export const waitlistRoutes = new Hono<AppEnv>();

waitlistRoutes.post(
  "/",
  rateLimiter({ namespace: "waitlist", windowMs: 60_000, limit: 5 }),
  async (c) => {
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

    return c.json({ joined: true });
  },
);
