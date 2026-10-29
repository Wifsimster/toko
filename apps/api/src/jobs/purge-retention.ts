import { and, isNull, lt } from "drizzle-orm";
import { db, events, childInvitations, auditLog } from "@focusflow/db";

const EVENTS_RETENTION_DAYS = 395;
const AUDIT_RETENTION_DAYS = 3 * 365;

export async function runPurgeRetention(): Promise<{
  events: number;
  invitations: number;
  auditLog: number;
}> {
  const now = Date.now();
  const eventsCutoff = new Date(now - EVENTS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const auditCutoff = new Date(now - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const nowDate = new Date(now);

  const purgedEvents = await db
    .delete(events)
    .where(lt(events.createdAt, eventsCutoff))
    .returning({ id: events.id });

  const purgedInvites = await db
    .delete(childInvitations)
    .where(and(lt(childInvitations.expiresAt, nowDate), isNull(childInvitations.acceptedAt)))
    .returning({ id: childInvitations.id });

  const purgedAudit = await db
    .delete(auditLog)
    .where(lt(auditLog.createdAt, auditCutoff))
    .returning({ id: auditLog.id });

  return {
    events: purgedEvents.length,
    invitations: purgedInvites.length,
    auditLog: purgedAudit.length,
  };
}
