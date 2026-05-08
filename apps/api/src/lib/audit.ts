import { and, desc, eq } from "drizzle-orm";
import { db, auditLog, user as userTable } from "@focusflow/db";

type EntityType =
  | "child"
  | "symptom"
  | "journal"
  | "medication"
  | "medication_log"
  | "crisis_item"
  | "child_access"
  | "child_invitation";

type Action = "create" | "update" | "delete" | "accept" | "revoke";

interface LogAuditOptions {
  actorId: string;
  actorName?: string | null;
  childId?: string | null;
  entityType: EntityType;
  entityId?: string | null;
  action: Action;
  summary?: string | null;
}

// Best-effort write — we never want a failed audit insert to roll back
// the user's actual mutation. Most callers use this fire-and-forget
// after a successful insert/update, inside a try/catch upstream.
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
    // Swallow — the audit feed is non-critical. A future hardening pass
    // can wire this into the structured logger.
    console.error("audit_log_write_failed", err);
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

// Recent activity feed for a child. Joins to user so we can refresh the
// actor's name if it was missing (older rows pre-feature) — but always
// prefers the snapshot stored at write time (resilient to user deletion).
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

// Used when a row is being inserted on a child the actor already has
// access to, but the route handler hasn't yet re-fetched the actor's
// display name from the session. Cheap call.
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

// Re-export to keep the unused-import noise low in callers — they
// don't typically need the helper above directly.
export { and };
