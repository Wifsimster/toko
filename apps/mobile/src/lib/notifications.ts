import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const MORNING_ID = "morning-reminder";
const EVENING_ID = "evening-checkin";
const ANDROID_CHANNEL_ID = "checkin-reminders";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function parseHhmm(time: string): { hour: number; minute: number } | null {
  if (!TIME_REGEX.test(time)) return null;
  const [hour, minute] = time.split(":").map((n) => Number.parseInt(n, 10));
  return { hour: hour!, minute: minute! };
}

const TUNNEL_START_MIN = 16 * 60 + 30;
const TUNNEL_END_MIN = 21 * 60;

export function clampOutOfTunnel(hour: number, minute: number): {
  hour: number;
  minute: number;
} {
  const mins = hour * 60 + minute;
  if (mins >= TUNNEL_START_MIN && mins < TUNNEL_END_MIN) {
    return { hour: 21, minute: 0 };
  }
  return { hour, minute };
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Rappels",
      importance: Notifications.AndroidImportance.HIGH,
      enableVibrate: true,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined" | "unsupported"
> {
  if (!Device.isDevice) return "unsupported";
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export async function scheduleMorningReminder(
  hour = 9,
  minute = 0,
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  ({ hour, minute } = clampOutOfTunnel(hour, minute));

  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(
    () => undefined,
  );

  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_ID,
    content: {
      title: "Un nouveau jour commence",
      body: "Prends un petit moment pour démarrer la journée avec ton enfant.",
      data: { url: Linking.createURL("home") },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function cancelMorningReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(
    () => undefined,
  );
}

export async function scheduleEveningReminder(
  hour = 20,
  minute = 30,
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  ({ hour, minute } = clampOutOfTunnel(hour, minute));

  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(
    () => undefined,
  );

  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_ID,
    content: {
      title: "C'est l'heure du point du soir",
      body: "Prends un instant pour noter la journée.",
      data: { url: Linking.createURL("checkin") },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function cancelEveningReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(
    () => undefined,
  );
}

export async function reconcileLocalReminders(opts: {
  morning: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
}): Promise<void> {
  const morning = parseHhmm(opts.morning.time);
  if (opts.morning.enabled && morning) {
    await scheduleMorningReminder(morning.hour, morning.minute);
  } else {
    await cancelMorningReminder();
  }

  const evening = parseHhmm(opts.evening.time);
  if (opts.evening.enabled && evening) {
    await scheduleEveningReminder(evening.hour, evening.minute);
  } else {
    await cancelEveningReminder();
  }
}
