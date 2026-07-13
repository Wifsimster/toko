import { and, isNull, lt } from "drizzle-orm";
import { db, events, childInvitations } from "@focusflow/db";

// Retention purge (RGPD data minimisation / storage limitation).
// - Product analytics events older than 13 months are deleted (standard
//   audience-measurement retention). Rows already survive account deletion
//   via SET NULL, so this is the backstop that actually bounds their life.
// - Expired, never-accepted co-parent invitations are removed — they hold a
//   third party's email that no longer serves any purpose.
const EVENTS_RETENTION_DAYS = 395; // ~13 months

export async function runPurgeRetention(): Promise<{
  events: number;
  invitations: number;
}> {
  const eventsCutoff = new Date(Date.now() - EVENTS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();

  const purgedEvents = await db
    .delete(events)
    .where(lt(events.createdAt, eventsCutoff))
    .returning({ id: events.id });

  const purgedInvites = await db
    .delete(childInvitations)
    .where(and(lt(childInvitations.expiresAt, now), isNull(childInvitations.acceptedAt)))
    .returning({ id: childInvitations.id });

  return { events: purgedEvents.length, invitations: purgedInvites.length };
}
