import type { LinkingOptions } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

import type { CompanionTabParamList, RootTabParamList } from "./types";

// Maps deep links AND notification taps to navigation. The scheduled evening
// reminder carries `data.url = toko://checkin` (see src/lib/notifications.ts),
// so tapping it opens the check-in screen, which then resolves the child.
function urlFromNotificationData(data: unknown): string | undefined {
  if (data && typeof data === "object" && "url" in data) {
    const url = (data as { url?: unknown }).url;
    return typeof url === "string" ? url : undefined;
  }
  return undefined;
}

// Cold-start + foreground notification-tap plumbing, shared by the full port
// and the companion — only the `config.screens` mapping differs between them.
async function getInitialURL(): Promise<string | undefined> {
  const url = await Linking.getInitialURL();
  if (url != null) return url;
  // Cold start from a notification tap.
  const response = await Notifications.getLastNotificationResponseAsync();
  return urlFromNotificationData(response?.notification.request.content.data);
}

function subscribe(listener: (url: string) => void): () => void {
  const onUrl = Linking.addEventListener("url", ({ url }) => listener(url));
  const onNotification =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const url = urlFromNotificationData(
        response.notification.request.content.data,
      );
      if (url) listener(url);
    });
  return () => {
    onUrl.remove();
    onNotification.remove();
  };
}

const prefixes = [Linking.createURL("/"), "toko://"];

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes,
  config: {
    screens: {
      // Nested to match the tab navigator: each tab owns a stack.
      AccueilTab: { screens: { Home: "home" } },
      SymptomesTab: { screens: { Checkin: "checkin" } },
    },
  },
  getInitialURL,
  subscribe,
};

// Phase 4 companion linking. Reuses the same notification `data.url` values
// (`home` / `checkin`) but routes them to the companion's own tabs — the
// morning reminder opens the Matin routine, the evening reminder the Soir one.
// Without this, a notification tap in companion mode targets AccueilTab /
// SymptomesTab, which don't exist in the 3-tab navigator, and nothing happens.
export const companionLinking: LinkingOptions<CompanionTabParamList> = {
  prefixes,
  config: {
    screens: {
      MatinTab: { screens: { Routines: "home" } },
      SoirTab: { screens: { Routines: "checkin" } },
    },
  },
  getInitialURL,
  subscribe,
};
