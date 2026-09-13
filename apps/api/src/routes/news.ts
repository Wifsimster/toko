import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { db, news, user } from "@focusflow/db";
import { createNewsSchema, updateNewsSchema } from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { parseBody } from "../lib/http/validate";

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

async function isAdmin(userId: string): Promise<boolean> {
  const [u] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, userId));
  return u?.isAdmin ?? false;
}

// GET /api/news/check-admin — check if current user is admin
newsRoutes.get("/check-admin", async (c) => {
  const currentUser = c.get("user");
  const admin = await isAdmin(currentUser.id);
  return c.json({ isAdmin: admin });
});

// GET /api/news — list published articles (all authenticated users)
newsRoutes.get("/", async (c) => {
  const result = await db
    .select()
    .from(news)
    .where(and(eq(news.published, true), isNotNull(news.publishedAt)))
    .orderBy(desc(news.publishedAt));

  return c.json(result);
});

// GET /api/news/admin — list ALL articles including drafts (admin only)
newsRoutes.get("/admin", async (c) => {
  const currentUser = c.get("user");
  await requireAdmin(currentUser.id);

  const result = await db
    .select()
    .from(news)
    .orderBy(desc(news.createdAt));

  return c.json(result);
});

// GET /api/news/admin/:id — single article by ID including drafts (admin only)
newsRoutes.get("/admin/:id", async (c) => {
  const currentUser = c.get("user");
  await requireAdmin(currentUser.id);

  const id = c.req.param("id");
  const [article] = await db
    .select()
    .from(news)
    .where(eq(news.id, id));

  if (!article) {
    throw new AppError("NOT_FOUND", "Article non trouvé", 404);
  }

  return c.json(article);
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

  const input = await parseBody(c, createNewsSchema);

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: news.id })
    .from(news)
    .where(eq(news.slug, input.slug));

  if (existing) {
    return c.json({ error: "Ce slug est déjà utilisé", code: "DUPLICATE_SLUG" }, 409);
  }

  const [article] = await db
    .insert(news)
    .values({
      ...input,
      authorId: currentUser.id,
      publishedAt: input.published ? new Date() : null,
    })
    .returning();

  return c.json(article, 201);
});

// PATCH /api/news/:id — update article (admin only)
newsRoutes.patch("/:id", async (c) => {
  const currentUser = c.get("user");
  await requireAdmin(currentUser.id);

  const id = c.req.param("id");
  const input = await parseBody(c, updateNewsSchema);

  const [existing] = await db
    .select()
    .from(news)
    .where(eq(news.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Article non trouvé", 404);
  }

  // If slug changed, check uniqueness
  if (input.slug && input.slug !== existing.slug) {
    const [dup] = await db
      .select({ id: news.id })
      .from(news)
      .where(eq(news.slug, input.slug));
    if (dup) {
      return c.json({ error: "Ce slug est déjà utilisé", code: "DUPLICATE_SLUG" }, 409);
    }
  }

  // Handle publishedAt when toggling published
  const publishedAt =
    input.published === true && !existing.publishedAt
      ? new Date()
      : input.published === false
        ? null
        : undefined;

  const values: Record<string, unknown> = {
    ...input,
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
