import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, desc } from "drizzle-orm";
import { db, journalEntries, children } from "@focusflow/db";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const journalRoutes = new Hono<AppEnv>();

journalRoutes.use("*", authMiddleware);

journalRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, user.id)));

  if (!child) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 100, 1), 500);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  const result = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.childId, childId))
    .orderBy(desc(journalEntries.date))
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

journalRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createJournalEntrySchema.safeParse(body);

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

  const [entry] = await db
    .insert(journalEntries)
    .values(parsed.data)
    .returning();

  return c.json(entry, 201);
});

journalRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateJournalEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Entrée non trouvée", 404);
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

  const [updated] = await db
    .update(journalEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(journalEntries.id, id))
    .returning();

  return c.json(updated);
});

journalRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Entrée non trouvée", 404);
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

  await db.delete(journalEntries).where(eq(journalEntries.id, id));
  return c.json({ ok: true });
});
