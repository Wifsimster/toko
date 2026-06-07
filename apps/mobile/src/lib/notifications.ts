import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * The evening check-in reminder is the decisive reason this app is native
 * rather than a TWA: a *scheduled, time-sensitive* notification that must fire
 * reliably even when the app is closed. PWAs cannot guarantee this; the OS can.
 * See docs/android-app.md.
 *
 * These are *phone* notifications (local, scheduled by the OS on this device).
 * They are the counterpart of the *e-mail* reminders sent server-side by the
 * cron jobs — the Réglages screen lets the parent choose either channel, or
 * both, per reminder. Phone opt-in is stored locally (per device) because the
 * schedule lives on the device; e-mail opt-in lives in the account
 * preferences. The reminder times are shared so both channels fire together.
 */

const MORNING_ID = "morning-reminder";
// Historical identifier — kept so existing installs replace, not duplicate.
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

/** Parses an "HH:mm" string into { hour, minute }, or null when malformed. */
function parseHhmm(time: string): { hour: number; minute: number } | null {
  if (!TIME_REGEX.test(time)) return null;
  const [hour, minute] = time.split(":").map((n) => Number.parseInt(n, 10));
  return { hour: hour!, minute: minute! };
}

/** Requests OS permission + sets up the Android notification channel. */
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

/** Current OS permission status, used to surface a hint in the settings UI. */
export async function getNotificationPermissionStatus(): Promise<
  "granted" | "denied" | "undetermined" | "unsupported"
> {
  if (!Device.isDevice) return "unsupported";
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

/** Schedules (or replaces) the daily morning reminder. Defaults to 09h00. */
export async function scheduleMorningReminder(
  hour = 9,
  minute = 0,
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

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

/** Cancels the morning reminder. */
export async function cancelMorningReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(
    () => undefined,
  );
}

/**
 * Schedules (or replaces) the daily evening check-in reminder. Defaults to
 * 20h30, inside the 16h30–21h00 window from the offline-strategy business rule.
 */
export async function scheduleEveningReminder(
  hour = 20,
  minute = 30,
): Promise<void> {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(
    () => undefined,
  );

  await Notifications.scheduleNotificationAsync({
    identifier: EVENING_ID,
    content: {
      title: "C'est l'heure du point du soir",
      body: "Prends un instant pour noter la journée.",
      // Tapping the reminder deep-links straight to the check-in screen
      // (handled in src/navigation/linking.ts).
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

/** Cancels the evening reminder. */
export async function cancelEveningReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(
    () => undefined,
  );
}

/**
 * Brings the OS-scheduled phone reminders in line with the parent's choices:
 * enables/schedules the ones turned on (at their configured time) and cancels
 * the rest. Idempotent — safe to call on every launch and on every settings
 * change. A malformed time leaves that reminder untouched-but-cancelled rather
 * than throwing.
 */
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
