import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View } from "react-native";

import {
  CalloutCard,
  Card,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  ACHIEVEMENTS,
  useAchievements,
  type AchievementId,
} from "../hooks/use-achievements";
import type { AchievementsProps } from "../navigation/types";

export function AchievementsScreen({ navigation, route }: AchievementsProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const { childId, childName } = route.params;
  const { unlocked, total, isLoading } = useAchievements(childId);
  const unlockedCount = unlocked.size;
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  // One-shot celebration of badges unlocked since the last visit. The seen set
  // is persisted per child so a revisit stays calm (no repeated fanfare).
  const [celebrated, setCelebrated] = useState<AchievementId[]>([]);
  useEffect(() => {
    if (isLoading || unlocked.size === 0) return;
    const key = `toko:achievements:seen:${childId}`;
    let cancelled = false;
    void AsyncStorage.getItem(key).then((raw) => {
      if (cancelled) return;
      const seen = new Set<string>(raw ? JSON.parse(raw) : []);
      const fresh = [...unlocked].filter((id) => !seen.has(id));
      if (fresh.length > 0) setCelebrated(fresh);
      void AsyncStorage.setItem(key, JSON.stringify([...unlocked]));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, childId]);

  const celebratedBadges = celebrated
    .map((id) => ACHIEVEMENTS.find((b) => b.id === id))
    .filter((b): b is (typeof ACHIEVEMENTS)[number] => !!b);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Mes badges"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* One-shot celebration of newly unlocked badges */}
      {celebratedBadges.length > 0 ? (
        <CalloutCard
          variant="success"
          label={
            celebratedBadges.length > 1
              ? `${celebratedBadges.length} nouveaux badges 🎉`
              : "Nouveau badge 🎉"
          }
        >
          {celebratedBadges.map((b) => (
            <Text key={b.id} style={styles.celebrateLine}>
              {b.emoji} {b.title}
            </Text>
          ))}
        </CalloutCard>
      ) : null}

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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    celebrateLine: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    progressCard: {
      gap: 10,
      backgroundColor: c.card,
      borderColor: c.border,
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },
    progressPct: {
      fontSize: 22,
      fontWeight: "700",
      color: "#7c3aed",
    },
    barTrack: {
      height: 8,
      backgroundColor: c.border,
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
      color: c.muted,
      lineHeight: 16,
    },
    cardUnlocked: {
      backgroundColor: c.card,
      borderColor: c.brand,
    },
    cardLocked: {
      backgroundColor: c.bg,
      borderColor: c.border,
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
      color: c.text,
      lineHeight: 20,
    },
    badgeTitleLocked: {
      color: c.muted,
    },
    badgeDesc: {
      fontSize: 13,
      color: c.subtext,
      lineHeight: 18,
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: 1,
    },
    pillUnlocked: {
      backgroundColor: c.successSurface,
      borderColor: c.successBorder,
    },
    pillLocked: {
      backgroundColor: "transparent",
      borderColor: c.border,
    },
    pillText: {
      fontSize: 11,
      fontWeight: "600",
    },
    pillTextUnlocked: {
      color: c.successFg,
    },
    pillTextLocked: {
      color: c.muted,
    },
  });
