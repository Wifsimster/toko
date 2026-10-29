import { db, events } from "@focusflow/db";
import type { CreateEventInput } from "@focusflow/validators";

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
  }
}
