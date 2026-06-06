import * as WebBrowser from "expo-web-browser";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useBarkleyStars,
  useBarkleyTodayLogs,
  useLogBarkleyBehavior,
} from "../hooks/use-barkley";
import { WEB_URL } from "../lib/config";
import type { BarkleyProps } from "../navigation/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BarkleyScreen({ navigation, route }: BarkleyProps) {
  const { childId, childName } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const logsQuery = useBarkleyTodayLogs(childId);
  const starsQuery = useBarkleyStars(childId);
  const logBehavior = useLogBarkleyBehavior(childId);

  const today = todayISO();
  const behaviors = logsQuery.data?.behaviors ?? [];
  const logs = logsQuery.data?.logs ?? [];

  // Build a set of behaviorIds that are marked completed today.
  const completedToday = new Set(
    logs.filter((l) => l.date === today && l.completed).map((l) => l.behaviorId),
  );

  function handleToggle(behaviorId: string) {
    const alreadyDone = completedToday.has(behaviorId);
    logBehavior.mutate({
      behaviorId,
      date: today,
      completed: !alreadyDone,
    });
  }

  const availableStars = starsQuery.data?.availableStars ?? 0;
  const weeklyStars = starsQuery.data?.weeklyStars ?? 0;

  const isLoading = logsQuery.isLoading;
  const hasError = logsQuery.isError;

  return (
    <Screen scroll>
      <ScreenHeader
        title="Programme Barkley"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* Stars summary — always shown when data is ready */}
      {starsQuery.data ? (
        <Card style={styles.starsCard}>
          <View style={styles.starsRow}>
            <View style={styles.starStat}>
              <Text style={styles.starNumber}>{availableStars}</Text>
              <Text style={styles.starLabel}>étoiles disponibles</Text>
            </View>
            <View style={styles.starDivider} />
            <View style={styles.starStat}>
              <Text style={styles.starNumber}>{weeklyStars}</Text>
              <Text style={styles.starLabel}>cette semaine</Text>
            </View>
          </View>
        </Card>
      ) : null}

      {/* Behaviors */}
      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <ErrorNote message="Impossible de charger les comportements." />
      ) : behaviors.length === 0 ? (
        <>
          <EmptyState
            title="Aucun comportement configuré"
            body="Configurez le tableau de comportements depuis le site web, puis revenez ici pour cocher les réussites du jour."
          />
          <PrimaryButton
            label="Configurer sur le site"
            onPress={() =>
              WebBrowser.openBrowserAsync(`${WEB_URL}/barkley`)
            }
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Aujourd'hui — {formatDate(today)}</Text>
          {logBehavior.isError ? (
            <ErrorNote message="Impossible d'enregistrer. Réessayez." />
          ) : null}
          {behaviors.map((b) => {
            const done = completedToday.has(b.id);
            const isPending =
              logBehavior.isPending &&
              logBehavior.variables?.behaviorId === b.id;
            return (
              <Pressable
                key={b.id}
                onPress={() => handleToggle(b.id)}
                disabled={isPending}
              >
                <Card style={[styles.behaviorCard, done && styles.behaviorDone]}>
                  <View style={styles.behaviorRow}>
                    <View style={[styles.check, done && styles.checkDone]}>
                      {done ? <Text style={styles.checkMark}>✓</Text> : null}
                    </View>
                    <View style={styles.behaviorContent}>
                      {b.icon ? (
                        <Text style={styles.behaviorIcon}>{b.icon}</Text>
                      ) : null}
                      <Text
                        style={[
                          styles.behaviorName,
                          done && styles.behaviorNameDone,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </View>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>
                        +{b.points} ⭐
                      </Text>
                    </View>
                  </View>
                  {done ? (
                    <Text style={styles.bravo}>Bravo ! C'est noté 🎉</Text>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}

          {/* Link to full programme */}
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync(`${WEB_URL}/barkley`)
            }
          >
            <Text style={styles.webLink}>
              Gérer le programme complet sur le site →
            </Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    starsCard: {
      backgroundColor: c.alertSurface,
      borderColor: c.alertBorder,
    },
    starsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    starStat: { alignItems: "center", gap: 2 },
    starNumber: {
      fontSize: 28,
      fontWeight: "700",
      color: c.alertFg,
    },
    starLabel: { fontSize: 12, color: c.alertFg },
    starDivider: {
      width: 1,
      height: 36,
      backgroundColor: c.alertBorder,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: c.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    behaviorCard: { gap: 4 },
    behaviorDone: {
      backgroundColor: c.successSurface,
      borderColor: c.successBorder,
    },
    behaviorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    check: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkDone: {
      backgroundColor: c.success,
      borderColor: c.success,
    },
    checkMark: { color: "#fff", fontSize: 16, fontWeight: "700" },
    behaviorContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    behaviorIcon: { fontSize: 20 },
    behaviorName: {
      fontSize: 16,
      fontWeight: "500",
      color: c.text,
      flex: 1,
    },
    behaviorNameDone: { color: c.success },
    pointsBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: c.tipSurface,
      borderRadius: 8,
    },
    pointsText: { fontSize: 13, fontWeight: "600", color: c.tipFg },
    bravo: {
      fontSize: 13,
      color: c.success,
      fontWeight: "500",
      paddingLeft: 40,
    },
    webLink: {
      color: c.action,
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 8,
    },
  });
