import { Hono } from "hono";
import { and, desc, eq, sql } from "drizzle-orm";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { parseBody } from "../lib/http/validate";
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

  // Insert only when the item exists (INSERT ... SELECT), so an unknown id
  // answers 404 instead of surfacing the FK violation as a 500.
  const inserted = await db
    .insert(roadmapVotes)
    .select(
      db
        .select({
          itemId: roadmapItems.id,
          userId: sql<string>`${currentUser.id}`.as("user_id"),
          createdAt: sql<Date>`now()`.as("created_at"),
        })
        .from(roadmapItems)
        .where(eq(roadmapItems.id, id)),
    )
    .onConflictDoNothing({
      target: [roadmapVotes.itemId, roadmapVotes.userId],
    })
    .returning({ itemId: roadmapVotes.itemId });

  if (inserted.length === 0) {
    // Nothing inserted: either the vote already existed (idempotent) or the
    // item does not exist.
    const [item] = await db
      .select({ id: roadmapItems.id })
      .from(roadmapItems)
      .where(eq(roadmapItems.id, id))
      .limit(1);
    if (!item) {
      throw new AppError("NOT_FOUND", "Élément introuvable.", 404);
    }
  }

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

  const input = await parseBody(c, createRoadmapItemSchema);

  const [row] = await db
    .insert(roadmapItems)
    .values({
      title: input.title,
      description: input.description ?? null,
      status: input.status,
    })
    .returning();

  return c.json(row, 201);
});

roadmapRoutes.patch("/:id", async (c) => {
  const currentUser = c.get("user");
  await assertAdmin(currentUser.id);

  const id = c.req.param("id");
  const input = await parseBody(c, updateRoadmapItemSchema);

  const [row] = await db
    .update(roadmapItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(roadmapItems.id, id))
    .returning();

  if (!row) return c.json({ error: "Item introuvable" }, 404);
  return c.json(row);
});
