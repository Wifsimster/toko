import { invalidateSessionCache, signOut } from "@/lib/auth-client";
import { releasePushSubscriptionForSignOut } from "@/lib/push";

export async function signOutAndLeave() {
  await releasePushSubscriptionForSignOut();
  invalidateSessionCache();
  await purgeApiCache();
  signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
}

async function purgeApiCache() {
  if (typeof caches === "undefined") return;
  try {
    await caches.delete("toko-api");
  } catch {}
}
