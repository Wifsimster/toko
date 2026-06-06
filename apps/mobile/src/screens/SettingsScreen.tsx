import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

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
import type { SettingsProps } from "../navigation/types";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function SettingsScreen({ navigation }: SettingsProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const prefs = usePreferences();
  const update = useUpdatePreferences();

  // Local state for time fields (committed on blur)
  const [morningTime, setMorningTime] = useState("09:00");
  const [eveningTime, setEveningTime] = useState("20:30");

  useEffect(() => {
    if (prefs.data) {
      setMorningTime(prefs.data.morningReminderTime);
      setEveningTime(prefs.data.eveningReminderTime);
    }
  }, [prefs.data]);

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
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title="Réglages"
        onBack={() => navigation.goBack()}
      />

      {prefs.isLoading ? (
        <Loader />
      ) : prefs.isError ? (
        <ErrorNote message="Impossible de charger vos réglages." />
      ) : prefs.data ? (
        <>
          {/* Rappel du matin */}
          <Card>
            <Text style={styles.sectionTitle}>Rappel du matin</Text>
            <Text style={styles.hint}>
              Un petit rappel pour démarrer la journée avec votre enfant.
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Activer</Text>
              <Switch
                value={prefs.data.dailyReminderOptIn}
                onValueChange={(v) => update.mutate({ dailyReminderOptIn: v })}
                trackColor={{ false: c.border, true: c.brand }}
                thumbColor="#fff"
                disabled={update.isPending}
              />
            </View>
            {prefs.data.dailyReminderOptIn && (
              <View style={styles.row}>
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
            <View style={styles.row}>
              <Text style={styles.label}>Activer</Text>
              <Switch
                value={prefs.data.eveningReminderOptIn}
                onValueChange={(v) => update.mutate({ eveningReminderOptIn: v })}
                trackColor={{ false: c.border, true: c.brand }}
                thumbColor="#fff"
                disabled={update.isPending}
              />
            </View>
            {prefs.data.eveningReminderOptIn && (
              <View style={styles.row}>
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

          {/* Résumé hebdomadaire */}
          <Card>
            <Text style={styles.sectionTitle}>Résumé de la semaine</Text>
            <Text style={styles.hint}>
              Un récapitulatif par e-mail chaque semaine.
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Activer</Text>
              <Switch
                value={prefs.data.weeklyDigestOptIn}
                onValueChange={(v) => update.mutate({ weeklyDigestOptIn: v })}
                trackColor={{ false: c.border, true: c.brand }}
                thumbColor="#fff"
                disabled={update.isPending}
              />
            </View>
          </Card>

          {update.isError ? (
            <ErrorNote message="Impossible d'enregistrer. Réessayez." />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
    hint: {
      fontSize: 13,
      color: c.muted,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 4,
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
