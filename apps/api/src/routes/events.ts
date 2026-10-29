import { Hono } from "hono";
import type { AppEnv } from "../types";
import { db, events } from "@focusflow/db";
import { createEventSchema } from "@focusflow/validators";
import { auth } from "../lib/auth";
import { parseBody } from "../lib/http/validate";

export const eventsRoutes = new Hono<AppEnv>();

eventsRoutes.post("/", async (c) => {
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
});
