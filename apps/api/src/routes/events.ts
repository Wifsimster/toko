import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { AppEnv } from "../types";
import { db, events } from "@focusflow/db";
import { createEventSchema } from "@focusflow/validators";
import { auth } from "../lib/auth";
import { parseBody } from "../lib/http/validate";
import { rateLimiter } from "../middleware/rate-limiter";

export const eventsRoutes = new Hono<AppEnv>();

eventsRoutes.post(
  "/",
  bodyLimit({
    maxSize: 4096,
    onError: (c) => c.json({ error: "PAYLOAD_TOO_LARGE" }, 413),
  }),
  rateLimiter({ namespace: "events", windowMs: 60_000, limit: 60 }),
  async (c) => {
    const input = await parseBody(c, createEventSchema);

    const session = await auth.api
      .getSession({ headers: c.req.raw.headers })
      .catch(() => null);

    await db.insert(events).values({
      parentId: session?.user.id ?? null,
      eventName: input.eventName,
      properties: input.properties,
      sessionId: input.sessionId,
    });

    return c.body(null, 204);
  },
);
