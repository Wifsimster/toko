import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { useBarkleyStars } from "../hooks/use-barkley";
import { useClaimReward, useRewards } from "../hooks/use-rewards";
import { WEB_URL } from "../lib/config";
import type { RewardsProps } from "../navigation/types";
import type { BarkleyReward } from "@focusflow/validators";

export function RewardsScreen({ navigation, route }: RewardsProps) {
  const { childId, childName } = route.params;

  const rewardsQuery = useRewards(childId);
  const starsQuery = useBarkleyStars(childId);
  const claim = useClaimReward(childId);

  // Track which reward triggered a claim error so we can show it inline.
  const [claimErrorId, setClaimErrorId] = useState<string | null>(null);

  const rewards = rewardsQuery.data ?? [];
  const availableStars = starsQuery.data?.availableStars ?? 0;

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

const styles = StyleSheet.create({
  heroCard: {
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    paddingVertical: 20,
    gap: 4,
  },
  heroNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#b45309",
  },
  heroLabel: {
    fontSize: 14,
    color: "#92400e",
  },
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
    color: colors.text,
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  costText: { fontSize: 13, color: colors.subtext },
  claimedBadge: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "500",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  claimButton: {
    backgroundColor: colors.action,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  claimButtonDisabled: {
    backgroundColor: colors.border,
  },
  claimText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  claimTextDisabled: {
    color: colors.muted,
  },
  webLink: {
    color: colors.action,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
  },
});
