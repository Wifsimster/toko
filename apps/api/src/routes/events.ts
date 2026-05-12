import { Hono } from "hono";
import type { AppEnv } from "../types";
import { db, events } from "@focusflow/db";
import { createEventSchema } from "@focusflow/validators";
import { auth } from "../lib/auth";

export const eventsRoutes = new Hono<AppEnv>();

// Analytics ingestion (issue #219). Auth is intentionally optional:
// signup_completed fires before the Better Auth session cookie is set.
// When a session exists, we tag the row with parentId so cohort
// analyses can stratify by user. The global IP rate limiter on /api/*
// is enough abuse protection for a fire-and-forget endpoint.
eventsRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const session = await auth.api
    .getSession({ headers: c.req.raw.headers })
    .catch(() => null);

  await db.insert(events).values({
    parentId: session?.user.id ?? null,
    eventName: parsed.data.eventName,
    properties: parsed.data.properties,
    sessionId: parsed.data.sessionId,
  });

  return c.body(null, 204);
});
