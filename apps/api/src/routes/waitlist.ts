import { Hono } from "hono";
import type { AppEnv } from "../types";
import { db, waitlistSignups } from "@focusflow/db";
import { joinWaitlistSchema } from "@focusflow/validators";
import { parseBody } from "../lib/http/validate";

export const waitlistRoutes = new Hono<AppEnv>();

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

  return c.json({ joined: true });
});
