import type { LinkingOptions } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

import { isAppLink } from "../lib/app-link";
import type { CompanionTabParamList, RootTabParamList } from "./types";

function urlFromNotificationData(data: unknown): string | undefined {
  if (data && typeof data === "object" && "url" in data) {
    const url = (data as { url?: unknown }).url;
    return typeof url === "string" ? url : undefined;
  }
  return undefined;
}

let launchResponse: Promise<Notifications.NotificationResponse | null> | undefined;

function readLaunchResponse(): Promise<Notifications.NotificationResponse | null> {
  launchResponse ??= Notifications.getLastNotificationResponseAsync()
    .catch(() => null)
    .then((response) => {
      if (response) void Notifications.clearLastNotificationResponseAsync().catch(() => {});
      return response;
    });
  return launchResponse;
}

async function getInitialURL(): Promise<string | undefined> {
  const url = await Linking.getInitialURL();
  const response = await readLaunchResponse();
  if (url != null) return url;
  return urlFromNotificationData(response?.notification.request.content.data);
}

function isAppLinkUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return isAppLink(Linking.parse(url));
  } catch {
    return false;
  }
}

async function checkLaunch(): Promise<boolean> {
  const url = await Linking.getInitialURL().catch(() => null);
  if (isAppLinkUrl(url)) return true;
  return (await readLaunchResponse()) != null;
}

let launch: Promise<boolean> | undefined;

export function openedFromLinkOrNotification(): Promise<boolean> {
  launch ??= checkLaunch().catch(() => true);
  return launch;
}

export function onLinkOrNotification(listener: () => void): () => void {
  const onUrl = Linking.addEventListener("url", ({ url }) => {
    if (isAppLinkUrl(url)) listener();
  });
  const onNotification = Notifications.addNotificationResponseReceivedListener(() => listener());
  return () => {
    onUrl.remove();
    onNotification.remove();
  };
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
