import { db, events } from "@focusflow/db";
import type { CreateEventInput } from "@focusflow/validators";

// Fire-and-forget server-side analytics event. Used from webhook
// handlers and cron jobs where there is no HTTP client to call
// /api/events. Failures are logged by the caller — never throw past
// this helper because losing an analytics row must never block the
// real work (Stripe state sync, email sending, etc.).
export async function recordServerEvent(
  parentId: string | null,
  eventName: CreateEventInput["eventName"],
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.insert(events).values({
      parentId,
      eventName,
      properties,
      sessionId: "server",
    });
  } catch {
    // Swallow — analytics must never break the calling flow.
  }
}
