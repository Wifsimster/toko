import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq } from "drizzle-orm";
import { db, children, subscription } from "@focusflow/db";
import { createChildSchema, updateChildSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const childrenRoutes = new Hono<AppEnv>();

childrenRoutes.use("*", authMiddleware);

childrenRoutes.get("/", async (c) => {
  const user = c.get("user");
  const result = await db
    .select()
    .from(children)
    .where(eq(children.parentId, user.id));
  return c.json(result);
});

childrenRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createChildSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  // Enforce child limit based on subscription plan
  const existingChildren = await db
    .select()
    .from(children)
    .where(eq(children.parentId, user.id));

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .limit(1);

  const isActive =
    sub && (sub.status === "active" || sub.status === "trialing");
  const maxChildren = isActive ? 3 : 1;

  if (existingChildren.length >= maxChildren) {
    throw new AppError(
      "FORBIDDEN",
      isActive
        ? "Limite de 3 profils enfant atteinte pour le plan Famille."
        : "Limite de 1 profil enfant atteinte. Passez au plan Famille pour en ajouter jusqu'à 3.",
      403
    );
  }

  const [child] = await db
    .insert(children)
    .values({ ...parsed.data, parentId: user.id })
    .returning();

  return c.json(child, 201);
});

childrenRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [child] = await db
    .select()
    .from(children)
    .where(eq(children.id, id));

  if (!child || child.parentId !== user.id) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  return c.json(child);
});

childrenRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateChildSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(children)
    .where(eq(children.id, id));

  if (!existing || existing.parentId !== user.id) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  const [updated] = await db
    .update(children)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(children.id, id))
    .returning();

  return c.json(updated);
});

childrenRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(children)
    .where(eq(children.id, id));

  if (!existing || existing.parentId !== user.id) {
    throw new AppError("NOT_FOUND", "Enfant non trouvé", 404);
  }

  await db.delete(children).where(eq(children.id, id));
  return c.json({ ok: true });
});
