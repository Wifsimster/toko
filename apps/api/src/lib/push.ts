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

// VAPID setup is idempotent + lazy: if both keys are present we configure
// once on first call. Without them every send becomes a no-op. This means
// the app boots fine in dev without push being usable.
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
  // Where the user lands when they tap the notification. Relative to APP_URL.
  url?: string;
  // For deduping — multiple events on the same child collapse instead of
  // stacking, e.g. "Sophie a noté 3 entrées" replaces "Sophie a noté 1".
  tag?: string;
}

interface SendResult {
  sent: number;
  pruned: number;
}

// Fan-out helper: send `payload` to every registered subscription for
// `userId`. Endpoints that 404 / 410 (Gone) are pruned from the table —
// the user revoked the permission or rotated devices, and Stripe-style
// retry would just keep failing.
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
        // 404 (endpoint not found) and 410 (gone) mean the browser
        // dropped the subscription. Anything else is transient or our
        // fault — log and leave the row alone for the next attempt.
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

// Push the audit-log event to every co-parent on `childId` who has the
// coParentActivityOptIn preference set. The actor is excluded — they just
// did the action, they don't need a notification of their own work.
export async function notifyCoParents(opts: {
  childId: string;
  actorId: string;
  actorName: string | null;
  summary: string;
}): Promise<void> {
  // Find every user with access to the child except the actor.
  const peers = await db
    .select({ userId: childAccess.userId })
    .from(childAccess)
    .where(eq(childAccess.childId, opts.childId));

  const recipientIds = peers
    .map((p) => p.userId)
    .filter((id) => id !== opts.actorId);

  if (recipientIds.length === 0) return;

  // Filter to opted-in recipients (default off — see schema comment).
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
    // Tag per-child so two rapid edits collapse into the latest in the
    // notification tray rather than stacking.
    tag: `co-parent-activity-${opts.childId}`,
  };

  await Promise.all(targets.map((id) => sendPushToUser(id, payload)));
}

// Convenience for the unused-import linter when handlers only need the
// child-access table indirectly.
export { and };
