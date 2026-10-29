import { and, desc, eq } from "drizzle-orm";
import { db, auditLog, user as userTable } from "@focusflow/db";
import { notifyCoParents } from "./push";
import { log } from "./safe-logger";

export type EntityType =
  | "child"
  | "symptom"
  | "journal"
  | "medication"
  | "medication_log"
  | "crisis_item"
  | "child_access"
  | "child_invitation"
  | "routine"
  | "routine_completion";

export type Action = "create" | "update" | "delete" | "accept" | "revoke" | "cancel";

interface LogAuditOptions {
  actorId: string;
  actorName?: string | null;
  childId?: string | null;
  entityType: EntityType;
  entityId?: string | null;
  action: Action;
  summary?: string | null;
}

export async function logAudit(opts: LogAuditOptions): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorId: opts.actorId,
      actorName: opts.actorName ?? null,
      childId: opts.childId ?? null,
      entityType: opts.entityType,
      entityId: opts.entityId ?? null,
      action: opts.action,
      summary: opts.summary ?? null,
    });
  } catch (err) {
    log.error("audit_log_write_failed", { error: err instanceof Error ? err.message : String(err) });
  }

  if (opts.childId && opts.summary) {
    try {
      await notifyCoParents({
        childId: opts.childId,
        actorId: opts.actorId,
        actorName: opts.actorName ?? null,
        summary: opts.summary,
      });
    } catch (err) {
      log.error("co_parent_push_failed", { error: err instanceof Error ? err.message : String(err) });
    }
  }
}

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorName: string | null;
  childId: string | null;
  entityType: EntityType;
  entityId: string | null;
  action: Action;
  summary: string | null;
  createdAt: Date;
}

export async function listAuditForChild(
  childId: string,
  limit = 50,
): Promise<AuditEntry[]> {
  const rows = await db
    .select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      snapshotName: auditLog.actorName,
      currentName: userTable.name,
      childId: auditLog.childId,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      summary: auditLog.summary,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(userTable, eq(userTable.id, auditLog.actorId))
    .where(eq(auditLog.childId, childId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    actorId: r.actorId,
    actorName: r.snapshotName ?? r.currentName ?? null,
    childId: r.childId,
    entityType: r.entityType as EntityType,
    entityId: r.entityId,
    action: r.action as Action,
    summary: r.summary,
    createdAt: r.createdAt,
  }));
}

export async function getCreatorNames(
  childId: string,
  entityType: EntityType,
): Promise<Map<string, string>> {
  const rows = await db
    .select({
      entityId: auditLog.entityId,
      snapshotName: auditLog.actorName,
      currentName: userTable.name,
    })
    .from(auditLog)
    .leftJoin(userTable, eq(userTable.id, auditLog.actorId))
    .where(
      and(
        eq(auditLog.childId, childId),
        eq(auditLog.entityType, entityType),
        eq(auditLog.action, "create"),
      ),
    );

  const byEntity = new Map<string, string>();
  for (const r of rows) {
    if (!r.entityId) continue;
    const name = r.snapshotName ?? r.currentName;
    if (name) byEntity.set(r.entityId, name);
  }
  return byEntity;
}

export async function snapshotActorName(
  actorId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ name: userTable.name })
    .from(userTable)
    .where(eq(userTable.id, actorId))
    .limit(1);
  return row?.name ?? null;
}

export { and };
