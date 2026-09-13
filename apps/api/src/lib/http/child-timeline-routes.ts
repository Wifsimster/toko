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

/**
 * Child-scoped timeline resources — symptoms, journal entries, and any
 * dated record a parent logs day after day — all obey the same rules:
 * access is checked against `child_access`, the free plan sees a rolling
 * window, every write is audited, and list rows carry creator attribution
 * when the child is co-managed.
 *
 * Those rules used to be copy-pasted per entity: `routes/symptoms.ts` and
 * `routes/journal.ts` were the same 180 lines twice over, which is four
 * places to fix a history-window bug and a standing invitation to let the
 * two drift. Here they are written once, and a new timeline entity is a
 * configuration object rather than another copy.
 */

/** The columns a timeline table must expose for the shared handlers. */
export type TimelineTable = PgTable & {
  id: PgColumn;
  childId: PgColumn;
  date: PgColumn;
  updatedAt: PgColumn;
};

/** The fields the shared handlers read back off a row. */
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
  /** Audit entity type — also the key creator attribution is looked up by. */
  entityType: EntityType;
  /** 404 message, in French, for a row that does not exist. */
  notFoundMessage: string;
  createSchema: z.ZodType<TCreate>;
  updateSchema: z.ZodType<TUpdate>;
  /** Human-readable audit summaries, one per action. */
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

    // Creator attribution is only meaningful — and only shown — when the
    // child is co-managed. Skip the audit lookup entirely for a solo parent.
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

/**
 * Free plan only sees the last FREE_HISTORY_DAYS; premium gets full history
 * ("Historique complet de suivi" on the pricing grid). Gated on the child
 * OWNER's plan so a co-parent inherits full history when the owner has
 * Famille (mirrors lib/report).
 */
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
  return and(scoped, gte(table.date, localISODateDaysAgo(tz, FREE_HISTORY_DAYS)));
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
