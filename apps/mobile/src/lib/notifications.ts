import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * The evening check-in reminder is the decisive reason this app is native
 * rather than a TWA: a *scheduled, time-sensitive* notification that must fire
 * reliably even when the app is closed. PWAs cannot guarantee this; the OS can.
 * See docs/android-app.md.
 */

const EVENING_CHECKIN_ID = "evening-checkin";
const ANDROID_CHANNEL_ID = "checkin-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Requests OS permission + sets up the Android notification channel. */
export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Rappels du soir",
      importance: Notifications.AndroidImportance.HIGH,
      enableVibrate: true,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedules (or replaces) the daily evening check-in reminder. Defaults to
 * 18h30, inside the 16h30–21h00 window from the offline-strategy business rule.
 */
export async function scheduleEveningCheckin(hour = 18, minute = 30): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(EVENING_CHECKIN_ID).catch(
    () => undefined,
  );

  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_CHECKIN_ID,
    content: {
      title: "C'est l'heure du point du soir",
      body: "Prends un instant pour noter la journée.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

/** Cancels the evening reminder. */
export async function cancelEveningCheckin(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(EVENING_CHECKIN_ID).catch(
    () => undefined,
  );
}
