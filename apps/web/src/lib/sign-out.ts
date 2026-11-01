import { invalidateSessionCache, signOut } from "@/lib/auth-client";
import { releasePushSubscriptionForSignOut } from "@/lib/push";

export async function signOutAndLeave() {
  await releasePushSubscriptionForSignOut();
  invalidateSessionCache();
  signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
}
