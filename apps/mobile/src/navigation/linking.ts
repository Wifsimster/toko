import type { LinkingOptions } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

import type { CompanionTabParamList, RootTabParamList } from "./types";

function urlFromNotificationData(data: unknown): string | undefined {
  if (data && typeof data === "object" && "url" in data) {
    const url = (data as { url?: unknown }).url;
    return typeof url === "string" ? url : undefined;
  }
  return undefined;
}

async function getInitialURL(): Promise<string | undefined> {
  const url = await Linking.getInitialURL();
  if (url != null) return url;
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
      AccueilTab: {
        initialRouteName: "Home",
        screens: { Home: "home", Checkin: "checkin" },
      },
    },
  },
  getInitialURL,
  subscribe,
};

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
