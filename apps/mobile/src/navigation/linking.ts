import type { LinkingOptions } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

import type { RootTabParamList } from "./types";

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

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: [Linking.createURL("/"), "toko://"],
  config: {
    screens: {
      // Nested to match the tab navigator: each tab owns a stack.
      AccueilTab: { screens: { Home: "home" } },
      SymptomesTab: { screens: { Checkin: "checkin" } },
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url != null) return url;
    // Cold start from a notification tap.
    const response = await Notifications.getLastNotificationResponseAsync();
    return urlFromNotificationData(response?.notification.request.content.data);
  },
  subscribe(listener) {
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
  },
};
