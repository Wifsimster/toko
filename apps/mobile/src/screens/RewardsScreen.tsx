import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  SectionLabel,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useBarkleyStars,
  useBarkleyTodayLogs,
  useLogBarkleyBehavior,
} from "../hooks/use-barkley";
import { useClaimReward, useRewards } from "../hooks/use-rewards";
import { WEB_URL } from "../lib/config";
import type { RewardsProps } from "../navigation/types";
import type { BarkleyReward } from "@focusflow/validators";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function RewardsScreen({ navigation, route }: RewardsProps) {
  const { childId, childName } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const rewardsQuery = useRewards(childId);
  const starsQuery = useBarkleyStars(childId);
  const claim = useClaimReward(childId);
  const logsQuery = useBarkleyTodayLogs(childId);
  const logBehavior = useLogBarkleyBehavior(childId);

  // Track which reward triggered a claim error so we can show it inline.
  const [claimErrorId, setClaimErrorId] = useState<string | null>(null);

  const rewards = rewardsQuery.data ?? [];
  const availableStars = starsQuery.data?.availableStars ?? 0;

  const today = todayISO();
  const behaviors = logsQuery.data?.behaviors ?? [];
  const completedToday = new Set(
    (logsQuery.data?.logs ?? [])
      .filter((l) => l.date === today && l.completed)
      .map((l) => l.behaviorId),
  );

  function toggleBehavior(behaviorId: string) {
    logBehavior.mutate({
      behaviorId,
      date: today,
      completed: !completedToday.has(behaviorId),
    });
  }

  function handleClaim(reward: BarkleyReward) {
    setClaimErrorId(null);
    claim.mutate(reward.id, {
      onError: () => setClaimErrorId(reward.id),
    });
  }

  const isLoading = rewardsQuery.isLoading;
  const hasError = rewardsQuery.isError;

  return (
    <Screen scroll>
      <ScreenHeader
        title="Récompenses"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* Star balance hero */}
      {starsQuery.data ? (
        <Card style={styles.heroCard}>
          <Text style={styles.heroNumber}>{availableStars} ⭐</Text>
          <Text style={styles.heroLabel}>
            {availableStars === 1
              ? "étoile disponible"
              : "étoiles disponibles"}
          </Text>
        </Card>
      ) : null}

      {/* Earn stars — behaviour token board (matches the web RewardBoard) */}
      {behaviors.length > 0 ? (
        <>
          <SectionLabel>Gagner des étoiles</SectionLabel>
          {logBehavior.isError ? (
            <ErrorNote message="Impossible d'enregistrer. Réessayez." />
          ) : null}
          {behaviors.map((b) => {
            const done = completedToday.has(b.id);
            const isPending =
              logBehavior.isPending && logBehavior.variables?.behaviorId === b.id;
            return (
              <Pressable
                key={b.id}
                onPress={() => toggleBehavior(b.id)}
                disabled={isPending}
              >
                <Card style={[styles.behaviorCard, done && styles.behaviorDone]}>
                  <View style={[styles.check, done && styles.checkDone]}>
                    {done ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                  {b.icon ? <Text style={styles.behaviorIcon}>{b.icon}</Text> : null}
                  <Text style={[styles.behaviorName, done && styles.behaviorNameDone]}>
                    {b.name}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>+{b.points} ⭐</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </>
      ) : null}

      <SectionLabel>Dépenser ses étoiles</SectionLabel>

      {isLoading ? (
        <Loader />
      ) : hasError ? (
        <ErrorNote message="Impossible de charger les récompenses." />
      ) : rewards.length === 0 ? (
        <>
          <EmptyState
            title="Aucune récompense configurée"
            body="Ajoutez des récompenses depuis le site web pour que votre enfant puisse les débloquer avec ses étoiles."
          />
          <PrimaryButton
            label="Configurer sur le site"
            onPress={() =>
              WebBrowser.openBrowserAsync(`${WEB_URL}/rewards`)
            }
          />
        </>
      ) : (
        <>
          {rewards.map((reward) => {
            const canClaim = availableStars >= reward.starsRequired;
            const isPending =
              claim.isPending && claim.variables === reward.id;
            const hasClaimError = claimErrorId === reward.id;

            return (
              <Card key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardRow}>
                  {reward.icon ? (
                    <Text style={styles.rewardIcon}>{reward.icon}</Text>
                  ) : (
                    <Text style={styles.rewardIcon}>🎁</Text>
                  )}
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <View style={styles.costRow}>
                      <Text style={styles.costText}>
                        {reward.starsRequired} ⭐ nécessaires
                      </Text>
                      {reward.timesClaimed > 0 ? (
                        <Text style={styles.claimedBadge}>
                          ×{reward.timesClaimed} obtenu
                          {reward.timesClaimed > 1 ? "es" : "e"}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {hasClaimError ? (
                  <ErrorNote
                    message={
                      canClaim
                        ? "Erreur lors de l'obtention. Réessayez."
                        : `Pas assez d'étoiles (${availableStars}/${reward.starsRequired}).`
                    }
                  />
                ) : null}

                <Pressable
                  style={[
                    styles.claimButton,
                    !canClaim && styles.claimButtonDisabled,
                  ]}
                  onPress={() => handleClaim(reward)}
                  disabled={!canClaim || isPending || claim.isPending}
                >
                  <Text
                    style={[
                      styles.claimText,
                      !canClaim && styles.claimTextDisabled,
                    ]}
                  >
                    {isPending
                      ? "En cours…"
                      : canClaim
                        ? "Obtenir cette récompense"
                        : `Encore ${reward.starsRequired - availableStars} ⭐ à gagner`}
                  </Text>
                </Pressable>
              </Card>
            );
          })}

          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync(`${WEB_URL}/rewards`)
            }
          >
            <Text style={styles.webLink}>
              Gérer les récompenses sur le site →
            </Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    heroCard: {
      alignItems: "center",
      backgroundColor: c.alertSurface,
      borderColor: c.alertBorder,
      paddingVertical: 20,
      gap: 4,
    },
    heroNumber: {
      fontSize: 36,
      fontWeight: "700",
      color: c.alertFg,
    },
    heroLabel: {
      fontSize: 14,
      color: c.alertFg,
    },
    behaviorCard: { flexDirection: "row", alignItems: "center", gap: 12 },
    behaviorDone: { backgroundColor: c.successSurface, borderColor: c.successBorder },
    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkDone: { backgroundColor: c.success, borderColor: c.success },
    checkMark: { color: "#fff", fontSize: 15, fontFamily: fonts.bold },
    behaviorIcon: { fontSize: 20 },
    behaviorName: { flex: 1, fontSize: 16, color: c.text, fontFamily: fonts.medium },
    behaviorNameDone: { color: c.success },
    pointsBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: c.tipSurface,
      borderRadius: 8,
    },
    pointsText: { fontSize: 13, fontFamily: fonts.semibold, color: c.tipFg },
    rewardCard: { gap: 10 },
    rewardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rewardIcon: { fontSize: 32 },
    rewardInfo: { flex: 1, gap: 4 },
    rewardName: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
    costRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    costText: { fontSize: 13, color: c.subtext },
    claimedBadge: {
      fontSize: 12,
      color: c.success,
      fontWeight: "500",
      backgroundColor: c.successSurface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    claimButton: {
      backgroundColor: c.action,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    claimButtonDisabled: {
      backgroundColor: c.border,
    },
    claimText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "600",
    },
    claimTextDisabled: {
      color: c.muted,
    },
    webLink: {
      color: c.action,
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 8,
    },
  });
