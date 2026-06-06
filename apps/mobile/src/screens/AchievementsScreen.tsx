import { StyleSheet, Text, View } from "react-native";

import {
  Card,
  Loader,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import {
  ACHIEVEMENTS,
  useAchievements,
} from "../hooks/use-achievements";
import type { AchievementsProps } from "../navigation/types";

export function AchievementsScreen({ navigation, route }: AchievementsProps) {
  const { childId, childName } = route.params;
  const { unlocked, total, isLoading } = useAchievements(childId);
  const unlockedCount = unlocked.size;
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <Screen scroll>
      <ScreenHeader
        title="Mes badges"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* Progress summary */}
      <Card style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {unlockedCount} badge{unlockedCount > 1 ? "s" : ""} sur {total}{" "}
            débloqué{unlockedCount > 1 ? "s" : ""}
          </Text>
          <Text style={styles.progressPct}>{pct} %</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>

        <Text style={styles.progressNote}>
          Pas de classement, pas de pression — juste un miroir de ce que vous
          avez construit.
        </Text>
      </Card>

      {isLoading ? (
        <Loader />
      ) : (
        ACHIEVEMENTS.map((badge) => {
          const isUnlocked = unlocked.has(badge.id);
          return (
            <Card
              key={badge.id}
              style={isUnlocked ? styles.cardUnlocked : styles.cardLocked}
            >
              <View style={styles.badgeRow}>
                <Text
                  style={[
                    styles.emoji,
                    !isUnlocked && styles.emojiLocked,
                  ]}
                >
                  {badge.emoji}
                </Text>
                <View style={styles.badgeContent}>
                  <Text
                    style={[
                      styles.badgeTitle,
                      !isUnlocked && styles.badgeTitleLocked,
                    ]}
                  >
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                </View>
                <View
                  style={[
                    styles.pill,
                    isUnlocked ? styles.pillUnlocked : styles.pillLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isUnlocked ? styles.pillTextUnlocked : styles.pillTextLocked,
                    ]}
                  >
                    {isUnlocked ? "Débloqué" : "À venir"}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    gap: 10,
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  progressPct: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7c3aed",
  },
  barTrack: {
    height: 8,
    backgroundColor: "#ede9fe",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 999,
  },
  progressNote: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  cardUnlocked: {
    backgroundColor: "#faf5ff",
    borderColor: "#c4b5fd",
  },
  cardLocked: {
    backgroundColor: "#fafafa",
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  emojiLocked: {
    opacity: 0.35,
  },
  badgeContent: {
    flex: 1,
    gap: 2,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
  },
  badgeTitleLocked: {
    color: colors.muted,
  },
  badgeDesc: {
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillUnlocked: {
    backgroundColor: "#ede9fe",
    borderColor: "#c4b5fd",
  },
  pillLocked: {
    backgroundColor: "transparent",
    borderColor: colors.border,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  pillTextUnlocked: {
    color: "#6d28d9",
  },
  pillTextLocked: {
    color: colors.muted,
  },
});
