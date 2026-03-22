import { Hono } from "hono";
import { eq, and, gte, sql } from "drizzle-orm";
import { db, appointments, children } from "@focusflow/db";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const appointmentsRoutes = new Hono();

appointmentsRoutes.use("*", authMiddleware);

appointmentsRoutes.get("/:childId", async (c) => {
  const user = c.get("user") as { id: string };
  const childId = c.req.param("childId");

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.childId, childId))
    .orderBy(sql`${appointments.date} ASC`);

  return c.json(result);
});

appointmentsRoutes.get("/:childId/upcoming", async (c) => {
  const user = c.get("user") as { id: string };
  const childId = c.req.param("childId");

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const now = new Date();
  const result = await db
    .select()
    .from(appointments)
    .where(
      and(eq(appointments.childId, childId), gte(appointments.date, now))
    )
    .orderBy(sql`${appointments.date} ASC`)
    .limit(5);

  return c.json(result);
});

appointmentsRoutes.post("/", async (c) => {
  const user = c.get("user") as { id: string };
  const body = await c.req.json();
  const parsed = createAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, parsed.data.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  const [appointment] = await db
    .insert(appointments)
    .values({
      ...parsed.data,
      date: new Date(parsed.data.date),
    })
    .returning();

  return c.json(appointment, 201);
});

appointmentsRoutes.patch("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Rendez-vous non trouvé", 404);
  }

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, existing.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  const updateData = {
    ...parsed.data,
    ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(appointments)
    .set(updateData)
    .where(eq(appointments.id, id))
    .returning();

  return c.json(updated);
});

appointmentsRoutes.delete("/:id", async (c) => {
  const user = c.get("user") as { id: string };
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Rendez-vous non trouvé", 404);
  }

  const [child] = await db
    .select()
    .from(children)
    .where(
      and(eq(children.id, existing.childId), eq(children.parentId, user.id))
    );

  if (!child) {
    throw new AppError("FORBIDDEN", "Accès refusé", 403);
  }

  await db.delete(appointments).where(eq(appointments.id, id));
  return c.json({ ok: true });
});
