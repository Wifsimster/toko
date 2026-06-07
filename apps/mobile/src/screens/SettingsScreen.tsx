import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Mail, Smartphone } from "lucide-react-native";

import {
  Card,
  ErrorNote,
  Loader,
  Screen,
  ScreenHeader,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  usePreferences,
  useUpdatePreferences,
} from "../hooks/use-preferences";
import { usePhoneReminderPrefs } from "../hooks/use-phone-reminders";
import {
  getNotificationPermissionStatus,
  reconcileLocalReminders,
} from "../lib/notifications";
import type { SettingsProps } from "../navigation/types";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function SettingsScreen({ navigation }: SettingsProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const prefs = usePreferences();
  const update = useUpdatePreferences();
  const phone = usePhoneReminderPrefs();

  // Local state for time fields (committed on blur)
  const [morningTime, setMorningTime] = useState("09:00");
  const [eveningTime, setEveningTime] = useState("20:30");
  // OS permission status — drives the "activez les notifications" hint when a
  // phone reminder is on but the system permission is denied.
  const [permission, setPermission] = useState<
    "granted" | "denied" | "undetermined" | "unsupported" | null
  >(null);

  useEffect(() => {
    if (prefs.data) {
      setMorningTime(prefs.data.morningReminderTime);
      setEveningTime(prefs.data.eveningReminderTime);
    }
  }, [prefs.data]);

  useEffect(() => {
    void getNotificationPermissionStatus().then(setPermission);
  }, []);

  // Re-aligns the OS-scheduled phone notifications after a toggle or time
  // change. Optional overrides let callers reschedule with a value that is
  // committed in the same tick (before React state has flushed).
  const reschedule = (
    overrides: {
      morningPhone?: boolean;
      eveningPhone?: boolean;
      morning?: string;
      evening?: string;
    } = {},
  ) => {
    void reconcileLocalReminders({
      morning: {
        enabled: overrides.morningPhone ?? phone.prefs.morningPhone,
        time: overrides.morning ?? morningTime,
      },
      evening: {
        enabled: overrides.eveningPhone ?? phone.prefs.eveningPhone,
        time: overrides.evening ?? eveningTime,
      },
    });
  };

  const toggleMorningPhone = (v: boolean) => {
    phone.update({ morningPhone: v });
    reschedule({ morningPhone: v });
    if (v) void getNotificationPermissionStatus().then(setPermission);
  };

  const toggleEveningPhone = (v: boolean) => {
    phone.update({ eveningPhone: v });
    reschedule({ eveningPhone: v });
    if (v) void getNotificationPermissionStatus().then(setPermission);
  };

  const commitMorningTime = () => {
    if (!prefs.data) return;
    if (
      !TIME_REGEX.test(morningTime) ||
      morningTime === prefs.data.morningReminderTime
    ) {
      setMorningTime(prefs.data.morningReminderTime);
      return;
    }
    update.mutate({ morningReminderTime: morningTime });
    reschedule({ morning: morningTime });
  };

  const commitEveningTime = () => {
    if (!prefs.data) return;
    if (
      !TIME_REGEX.test(eveningTime) ||
      eveningTime === prefs.data.eveningReminderTime
    ) {
      setEveningTime(prefs.data.eveningReminderTime);
      return;
    }
    update.mutate({ eveningReminderTime: eveningTime });
    reschedule({ evening: eveningTime });
  };

  const anyPhoneOn = phone.prefs.morningPhone || phone.prefs.eveningPhone;
  const showPermissionHint = anyPhoneOn && permission === "denied";

  return (
    <Screen scroll>
      <ScreenHeader title="Réglages" onBack={() => navigation.goBack()} />

      {prefs.isLoading ? (
        <Loader />
      ) : prefs.isError ? (
        <ErrorNote message="Impossible de charger vos réglages." />
      ) : prefs.data ? (
        <>
          <Text style={styles.intro}>
            Choisissez comment être prévenu pour chaque rappel : sur le
            téléphone (une notification sur cet appareil) ou par e-mail.
          </Text>

          {showPermissionHint ? (
            <Text style={styles.permissionHint}>
              Les notifications sont désactivées pour Tokō. Activez-les dans les
              réglages de votre téléphone pour recevoir les rappels.
            </Text>
          ) : null}

          {/* Rappel du matin */}
          <Card>
            <Text style={styles.sectionTitle}>Rappel du matin</Text>
            <Text style={styles.hint}>
              Un petit rappel pour démarrer la journée avec votre enfant.
            </Text>

            <ChannelRow
              styles={styles}
              c={c}
              icon={<Smartphone size={18} color={c.muted} />}
              label="Sur le téléphone"
              sublabel="Notification sur cet appareil"
              value={phone.prefs.morningPhone}
              onValueChange={toggleMorningPhone}
              disabled={!phone.loaded}
            />
            <ChannelRow
              styles={styles}
              c={c}
              icon={<Mail size={18} color={c.muted} />}
              label="Par e-mail"
              sublabel="Dans votre boîte mail"
              value={prefs.data.dailyReminderOptIn}
              onValueChange={(v) => update.mutate({ dailyReminderOptIn: v })}
              disabled={update.isPending}
            />

            {(phone.prefs.morningPhone || prefs.data.dailyReminderOptIn) && (
              <View style={styles.timeRow}>
                <Text style={styles.label}>Heure</Text>
                <TextInput
                  style={styles.timeInput}
                  value={morningTime}
                  onChangeText={setMorningTime}
                  onBlur={commitMorningTime}
                  placeholder="HH:MM"
                  placeholderTextColor={c.muted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            )}
          </Card>

          {/* Rappel du soir */}
          <Card>
            <Text style={styles.sectionTitle}>Rappel du soir</Text>
            <Text style={styles.hint}>
              Pour faire le point en fin de journée.
            </Text>

            <ChannelRow
              styles={styles}
              c={c}
              icon={<Smartphone size={18} color={c.muted} />}
              label="Sur le téléphone"
              sublabel="Notification sur cet appareil"
              value={phone.prefs.eveningPhone}
              onValueChange={toggleEveningPhone}
              disabled={!phone.loaded}
            />
            <ChannelRow
              styles={styles}
              c={c}
              icon={<Mail size={18} color={c.muted} />}
              label="Par e-mail"
              sublabel="Dans votre boîte mail"
              value={prefs.data.eveningReminderOptIn}
              onValueChange={(v) => update.mutate({ eveningReminderOptIn: v })}
              disabled={update.isPending}
            />

            {(phone.prefs.eveningPhone || prefs.data.eveningReminderOptIn) && (
              <View style={styles.timeRow}>
                <Text style={styles.label}>Heure</Text>
                <TextInput
                  style={styles.timeInput}
                  value={eveningTime}
                  onChangeText={setEveningTime}
                  onBlur={commitEveningTime}
                  placeholder="HH:MM"
                  placeholderTextColor={c.muted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            )}
          </Card>

          {/* Résumé hebdomadaire — e-mail uniquement par nature */}
          <Card>
            <Text style={styles.sectionTitle}>Résumé de la semaine</Text>
            <Text style={styles.hint}>
              Un récapitulatif par e-mail chaque semaine.
            </Text>
            <ChannelRow
              styles={styles}
              c={c}
              icon={<Mail size={18} color={c.muted} />}
              label="Par e-mail"
              sublabel="Dans votre boîte mail"
              value={prefs.data.weeklyDigestOptIn}
              onValueChange={(v) => update.mutate({ weeklyDigestOptIn: v })}
              disabled={update.isPending}
            />
          </Card>

          {update.isError ? (
            <ErrorNote message="Impossible d'enregistrer. Réessayez." />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function ChannelRow({
  styles,
  c,
  icon,
  label,
  sublabel,
  value,
  onValueChange,
  disabled,
}: {
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  icon: ReactNode;
  label: string;
  sublabel: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.channelRow}>
      <View style={styles.channelIcon}>{icon}</View>
      <View style={styles.channelText}>
        <Text style={styles.channelLabel}>{label}</Text>
        <Text style={styles.channelSublabel}>{sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: c.border, true: c.brand }}
        thumbColor="#fff"
        disabled={disabled}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: {
      fontSize: 14,
      color: c.muted,
      lineHeight: 20,
    },
    permissionHint: {
      fontSize: 13,
      color: c.alertFg,
      backgroundColor: c.alertSurface,
      borderColor: c.alertBorder,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      lineHeight: 18,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
    hint: {
      fontSize: 13,
      color: c.muted,
    },
    channelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      marginTop: 4,
    },
    channelIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    channelText: {
      flex: 1,
    },
    channelLabel: {
      fontSize: 15,
      color: c.text,
    },
    channelSublabel: {
      fontSize: 12,
      color: c.muted,
      marginTop: 1,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 10,
      marginTop: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    label: {
      fontSize: 15,
      color: c.subtext,
      flex: 1,
    },
    timeInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.card,
      minWidth: 80,
      textAlign: "center",
    },
  });
