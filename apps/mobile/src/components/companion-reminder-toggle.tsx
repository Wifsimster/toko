import { useMemo } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Bell } from "lucide-react-native";

import { Card, fonts } from "./ui";
import { useTheme, type Palette } from "../lib/theme";
import type { CompanionSlot } from "../lib/companion-slots";
import { usePhoneReminderPrefs } from "../hooks/use-phone-reminders";
import { usePreferences } from "../hooks/use-preferences";
import { reconcileLocalReminders } from "../lib/notifications";

/**
 * Phase 4 companion: a single-switch reminder card shown at the top of the
 * Matin / Soir routine screen. The companion has no Settings screen, so this is
 * the only place a parent can opt into (or out of) the local notification for
 * that half of the day. Toggling on prompts for the OS permission and schedules
 * the exact daily reminder — the companion's decisive feature — at the time set
 * on the account.
 */
export function CompanionReminderToggle({ slot }: { slot: CompanionSlot }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const phone = usePhoneReminderPrefs();
  const prefs = usePreferences();

  if (!phone.loaded) return null;

  const enabled =
    slot === "morning" ? phone.prefs.morningPhone : phone.prefs.eveningPhone;

  const onToggle = (v: boolean) => {
    phone.update(slot === "morning" ? { morningPhone: v } : { eveningPhone: v });
    if (!prefs.data) return; // root sync reconciles once prefs load
    void reconcileLocalReminders({
      morning: {
        enabled: slot === "morning" ? v : phone.prefs.morningPhone,
        time: prefs.data.morningReminderTime,
      },
      evening: {
        enabled: slot === "evening" ? v : phone.prefs.eveningPhone,
        time: prefs.data.eveningReminderTime,
      },
    });
  };

  const label = slot === "morning" ? "Rappel du matin" : "Rappel du soir";

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Bell size={18} color={c.muted} />
        </View>
        <View style={styles.text}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sublabel}>Notification sur cet appareil</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: c.border, true: c.brand }}
          thumbColor="#fff"
        />
      </View>
    </Card>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bg,
    },
    text: { flex: 1 },
    label: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    sublabel: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
  });
