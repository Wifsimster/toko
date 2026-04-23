import { Hono } from "hono";
import { and, desc, eq, sql } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import {
  db,
  user,
  roadmapItems,
  roadmapVotes,
} from "@focusflow/db";
import {
  createRoadmapItemSchema,
  updateRoadmapItemSchema,
} from "@focusflow/validators";

export const roadmapRoutes = new Hono<AppEnv>();

roadmapRoutes.use("*", authMiddleware);

async function assertAdmin(userId: string) {
  const [row] = await db
    .select({ isAdmin: user.isAdmin })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!row?.isAdmin) {
    throw new AppError("FORBIDDEN", "Action réservée aux admins", 403);
  }
}

/**
 * GET /api/roadmap
 * Public (auth required) list of roadmap items with their current vote
 * count and whether the caller has already voted.
 */
roadmapRoutes.get("/", async (c) => {
  const currentUser = c.get("user");

  const rows = await db
    .select({
      id: roadmapItems.id,
      title: roadmapItems.title,
      description: roadmapItems.description,
      status: roadmapItems.status,
      createdAt: roadmapItems.createdAt,
      votes: sql<number>`cast(count(${roadmapVotes.itemId}) as int)`,
      votedByMe: sql<boolean>`bool_or(${roadmapVotes.userId} = ${currentUser.id})`,
    })
    .from(roadmapItems)
    .leftJoin(roadmapVotes, eq(roadmapVotes.itemId, roadmapItems.id))
    .groupBy(roadmapItems.id)
    .orderBy(desc(sql`count(${roadmapVotes.itemId})`), desc(roadmapItems.createdAt));

  return c.json(rows);
});

/**
 * POST /api/roadmap/:id/vote    → add the caller's vote (idempotent)
 * DELETE /api/roadmap/:id/vote  → remove it
 */
roadmapRoutes.post("/:id/vote", async (c) => {
  const currentUser = c.get("user");
  const id = c.req.param("id");

  await db
    .insert(roadmapVotes)
    .values({ itemId: id, userId: currentUser.id })
    .onConflictDoNothing({
      target: [roadmapVotes.itemId, roadmapVotes.userId],
    });

  return c.json({ voted: true });
});

roadmapRoutes.delete("/:id/vote", async (c) => {
  const currentUser = c.get("user");
  const id = c.req.param("id");

  await db
    .delete(roadmapVotes)
    .where(
      and(
        eq(roadmapVotes.itemId, id),
        eq(roadmapVotes.userId, currentUser.id)
      )
    );

  return c.json({ voted: false });
});

/**
 * Admin-only item management.
 * POST   /api/roadmap       → create
 * PATCH  /api/roadmap/:id   → update title / description / status
 */
roadmapRoutes.post("/", async (c) => {
  const currentUser = c.get("user");
  await assertAdmin(currentUser.id);

  const body = await c.req.json().catch(() => ({}));
  const parsed = createRoadmapItemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  const [row] = await db
    .insert(roadmapItems)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
    })
    .returning();

  return c.json(row, 201);
});

roadmapRoutes.patch("/:id", async (c) => {
  const currentUser = c.get("user");
  await assertAdmin(currentUser.id);

  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateRoadmapItemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload invalide", issues: parsed.error.issues }, 422);
  }

  const [row] = await db
    .update(roadmapItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(roadmapItems.id, id))
    .returning();

  if (!row) return c.json({ error: "Item introuvable" }, 404);
  return c.json(row);
});
