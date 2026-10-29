import webpush from "web-push";
import { eq, and } from "drizzle-orm";
import {
  db,
  pushSubscriptions,
  userPreferences,
  childAccess,
} from "@focusflow/db";
import { env } from "./env";
import { log } from "./safe-logger";

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  vapidConfigured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

interface SendResult {
  sent: number;
  pruned: number;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<SendResult> {
  if (!ensureVapid()) return { sent: 0, pruned: 0 };

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  if (subs.length === 0) return { sent: 0, pruned: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  let pruned = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.authKey },
          },
          body,
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
          pruned += 1;
        } else {
          log.warn("push_send_failed", { userId, status });
        }
      }
    }),
  );

  return { sent, pruned };
}

export async function notifyCoParents(opts: {
  childId: string;
  actorId: string;
  actorName: string | null;
  summary: string;
}): Promise<void> {
  const peers = await db
    .select({ userId: childAccess.userId })
    .from(childAccess)
    .where(eq(childAccess.childId, opts.childId));

  const recipientIds = peers
    .map((p) => p.userId)
    .filter((id) => id !== opts.actorId);

  if (recipientIds.length === 0) return;

  const optedIn = await db
    .select({ userId: userPreferences.userId })
    .from(userPreferences)
    .where(eq(userPreferences.coParentActivityOptIn, true));
  const optedInSet = new Set(optedIn.map((p) => p.userId));

  const targets = recipientIds.filter((id) => optedInSet.has(id));
  if (targets.length === 0) return;

  const actor = opts.actorName ?? "Un co-parent";
  const payload: PushPayload = {
    title: actor,
    body: opts.summary,
    url: `/dashboard?child=${opts.childId}`,
    tag: `co-parent-activity-${opts.childId}`,
  };

  await Promise.all(targets.map((id) => sendPushToUser(id, payload)));
}

export { and };
