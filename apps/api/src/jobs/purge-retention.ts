import { and, isNull, lt } from "drizzle-orm";
import { db, events, childInvitations, auditLog } from "@focusflow/db";

// Retention purge (RGPD data minimisation / storage limitation).
// - Product analytics events older than 13 months are deleted (standard
//   audience-measurement retention). Rows already survive account deletion
//   via SET NULL, so this is the backstop that actually bounds their life.
// - Expired, never-accepted co-parent invitations are removed — they hold a
//   third party's email that no longer serves any purpose.
// - Audit-log rows older than 3 years are deleted. They are kept for
//   co-parent traceability (legitimate interest) but must not live forever;
//   actorName is retained by design for that window only.
const EVENTS_RETENTION_DAYS = 395; // ~13 months
const AUDIT_RETENTION_DAYS = 3 * 365; // ~3 years

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
