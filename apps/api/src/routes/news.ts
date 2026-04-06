import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, desc, isNotNull, sql } from "drizzle-orm";
import { db, news, user } from "@focusflow/db";
import { createNewsSchema, updateNewsSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const newsRoutes = new Hono<AppEnv>();

// All news routes require auth
newsRoutes.use("*", authMiddleware);

async function requireAdmin(userId: string) {
  const [u] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, userId));
  if (!u?.isAdmin) {
    throw new AppError("FORBIDDEN", "Accès réservé aux administrateurs", 403);
  }
}

// GET /api/news — list published articles (all authenticated users)
newsRoutes.get("/", async (c) => {
  const result = await db
    .select()
    .from(news)
    .where(and(eq(news.published, true), isNotNull(news.publishedAt)))
    .orderBy(desc(news.publishedAt));

  return c.json(result);
});

// GET /api/news/:slug — single article by slug
newsRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const [article] = await db
    .select()
    .from(news)
    .where(and(eq(news.slug, slug), eq(news.published, true)));

  if (!article) {
    throw new AppError("NOT_FOUND", "Article non trouvé", 404);
  }

  return c.json(article);
});

// POST /api/news — create article (admin only)
newsRoutes.post("/", async (c) => {
  const currentUser = c.get("user");
  await requireAdmin(currentUser.id);

  const body = await c.req.json();
  const parsed = createNewsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: news.id })
    .from(news)
    .where(eq(news.slug, parsed.data.slug));

  if (existing) {
    return c.json({ error: "Ce slug est déjà utilisé", code: "DUPLICATE_SLUG" }, 409);
  }

  const [article] = await db
    .insert(news)
    .values({
      ...parsed.data,
      authorId: currentUser.id,
      publishedAt: parsed.data.published ? new Date() : null,
    })
    .returning();

  return c.json(article, 201);
});

// PATCH /api/news/:id — update article (admin only)
newsRoutes.patch("/:id", async (c) => {
  const currentUser = c.get("user");
  await requireAdmin(currentUser.id);

  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateNewsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422
    );
  }

  const [existing] = await db
    .select()
    .from(news)
    .where(eq(news.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Article non trouvé", 404);
  }

  // If slug changed, check uniqueness
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const [dup] = await db
      .select({ id: news.id })
      .from(news)
      .where(eq(news.slug, parsed.data.slug));
    if (dup) {
      return c.json({ error: "Ce slug est déjà utilisé", code: "DUPLICATE_SLUG" }, 409);
    }
  }

  // Handle publishedAt when toggling published
  const publishedAt =
    parsed.data.published === true && !existing.publishedAt
      ? new Date()
      : parsed.data.published === false
        ? null
        : undefined;

  const values: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };
  if (publishedAt !== undefined) {
    values.publishedAt = publishedAt;
  }

  const [article] = await db
    .update(news)
    .set(values)
    .where(eq(news.id, id))
    .returning();

  return c.json(article);
});

// DELETE /api/news/:id — delete article (admin only)
newsRoutes.delete("/:id", async (c) => {
  const currentUser = c.get("user");
  await requireAdmin(currentUser.id);

  const id = c.req.param("id");

  const [existing] = await db
    .select({ id: news.id })
    .from(news)
    .where(eq(news.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Article non trouvé", 404);
  }

  await db.delete(news).where(eq(news.id, id));

  return c.json({ success: true });
});
