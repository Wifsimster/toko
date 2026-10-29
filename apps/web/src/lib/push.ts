import { api } from "@/lib/api-client";

export type PushEnableResult =
  | "subscribed"
  | "denied"
  | "dismissed"
  | "unconfigured"
  | "unsupported";

export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getServerPublicKey(): Promise<string | null> {
  const res = await api.get<{ publicKey: string | null }>("/push/public-key");
  return res.publicKey;
}

export async function subscribeToPush(): Promise<PushEnableResult> {
  if (!isPushSupported()) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission === "denied") return "denied";
  if (permission !== "granted") return "dismissed";

  const publicKey = await getServerPublicKey();
  if (!publicKey) return "unconfigured";

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await api.post<{ subscribed: boolean }>(
    "/push/subscribe",
    subscription.toJSON(),
  );
  return "subscribed";
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const { endpoint } = subscription;
  await subscription.unsubscribe();
  await api.delete<{ subscribed: boolean }>("/push/subscribe", { endpoint });
}

export async function reconcilePushSubscription(
  optedIn: boolean,
): Promise<void> {
  if (!optedIn || !isPushSupported()) return;
  if (Notification.permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return;

  await subscribeToPush().catch(() => {});
}

const SIGN_OUT_PUSH_TIMEOUT_MS = 2000;

async function dropSubscriptionForSignOut(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await api
    .delete<{ subscribed: boolean }>("/push/subscribe", {
      endpoint: subscription.endpoint,
    })
    .catch(() => {});
  await subscription.unsubscribe().catch(() => false);
}

export async function releasePushSubscriptionForSignOut(
  timeoutMs: number = SIGN_OUT_PUSH_TIMEOUT_MS,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      dropSubscriptionForSignOut(),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, timeoutMs);
      }),
    ]);
  } catch {
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
