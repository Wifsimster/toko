import { Hono } from "hono";
import { and, desc, eq, gte } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { z } from "zod";
import { db } from "@focusflow/db";
import type { AppEnv } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { AppError } from "../../middleware/error-handler";
import {
  assertChildAccess,
  childIsShared,
  getChildOwnerId,
} from "../child-access";
import { getCreatorNames, logAudit, type EntityType } from "../audit";
import { FREE_HISTORY_DAYS, getPremiumAccess } from "../premium";
import { getUserTimezone, localISODateDaysAgo } from "../local-date";
import { parseBody } from "./validate";

export type TimelineTable = PgTable & {
  id: PgColumn;
  childId: PgColumn;
  date: PgColumn;
  updatedAt: PgColumn;
};

export interface TimelineRow {
  id: string;
  childId: string;
  date: string;
  [key: string]: unknown;
}

export interface ChildTimelineOptions<
  TCreate extends { childId: string },
  TUpdate,
> {
  table: TimelineTable;
  entityType: EntityType;
  notFoundMessage: string;
  createSchema: z.ZodType<TCreate>;
  updateSchema: z.ZodType<TUpdate>;
  summaries: {
    create: (row: TimelineRow) => string;
    update: (row: TimelineRow) => string;
    delete: (row: TimelineRow) => string;
  };
}

export function createChildTimelineRoutes<
  TCreate extends { childId: string },
  TUpdate,
>(options: ChildTimelineOptions<TCreate, TUpdate>): Hono<AppEnv> {
  const { table, entityType, notFoundMessage, summaries } = options;
  const routes = new Hono<AppEnv>();

  routes.use("*", authMiddleware);

  routes.get("/:childId", async (c) => {
    const user = c.get("user");
    const childId = c.req.param("childId");

    await assertChildAccess(user.id, childId);

    const limit = Math.min(
      Math.max(Number(c.req.query("limit")) || 100, 1),
      500,
    );
    const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

    const rows = await db
      .select()
      .from(table)
      .where(await historyWindow(table, childId, user.id))
      .orderBy(desc(table.date))
      .limit(limit)
      .offset(offset);

    const creators = (await childIsShared(childId))
      ? await getCreatorNames(childId, entityType)
      : null;

    return c.json(
      (rows as TimelineRow[]).map((row) => ({
        ...row,
        createdByName: creators?.get(row.id) ?? null,
      })),
    );
  });

  routes.post("/", async (c) => {
    const user = c.get("user");
    const data = await parseBody(c, options.createSchema);

    await assertChildAccess(user.id, data.childId);

    const [created] = await db
      .insert(table)
      .values(data as never)
      .returning();

    if (created) {
      const row = created as TimelineRow;
      void logAudit({
        actorId: user.id,
        actorName: user.name ?? null,
        childId: row.childId,
        entityType,
        entityId: row.id,
        action: "create",
        summary: summaries.create(row),
      });
    }

    return c.json(created, 201);
  });

  routes.patch("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const data = await parseBody(c, options.updateSchema);

    const existing = await requireRow(table, id, notFoundMessage);
    await assertChildAccess(user.id, existing.childId);

    const [updated] = await db
      .update(table)
      .set({ ...(data as object), updatedAt: new Date() } as never)
      .where(eq(table.id, id))
      .returning();

    if (!updated) {
      throw new AppError("NOT_FOUND", notFoundMessage, 404);
    }

    const row = updated as TimelineRow;
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: row.childId,
      entityType,
      entityId: row.id,
      action: "update",
      summary: summaries.update(row),
    });

    return c.json(updated);
  });

  routes.delete("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const existing = await requireRow(table, id, notFoundMessage);
    await assertChildAccess(user.id, existing.childId);

    await db.delete(table).where(eq(table.id, id));

    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: existing.childId,
      entityType,
      entityId: existing.id,
      action: "delete",
      summary: summaries.delete(existing),
    });

    return c.json({ ok: true });
  });

  return routes;
}

async function historyWindow(
  table: TimelineTable,
  childId: string,
  viewerId: string,
) {
  const ownerId = (await getChildOwnerId(childId)) ?? viewerId;
  const { active: isPremium } = await getPremiumAccess(ownerId);
  const scoped = eq(table.childId, childId);
  if (isPremium) return scoped;

  const tz = await getUserTimezone(viewerId);
  return and(scoped, gte(table.date, localISODateDaysAgo(tz, FREE_HISTORY_DAYS - 1)));
}

async function requireRow(
  table: TimelineTable,
  id: string,
  notFoundMessage: string,
): Promise<TimelineRow> {
  const [existing] = await db.select().from(table).where(eq(table.id, id));
  if (!existing) {
    throw new AppError("NOT_FOUND", notFoundMessage, 404);
  }
  return existing as TimelineRow;
}
