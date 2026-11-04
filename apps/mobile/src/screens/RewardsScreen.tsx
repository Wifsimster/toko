import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

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
import { DailyMoTip } from "../components/mo/mo-tip";
import { WEB_URL } from "../lib/config";
import { backIfPushed } from "../navigation/tabs";
import type { RewardsProps } from "../navigation/types";
import type { BarkleyReward } from "@focusflow/validators";
import { ItemIcon, MoIcon } from "../components/item-icon";
import { iconFor } from "../lib/icon-for";
import { todayISO } from "../lib/date";
import { Mo } from "../components/mo/mo";
import { behaviorTracking, rewards as copy } from "../lib/copy";
import { rewardGoal } from "../lib/reward-goal";

const stars = (n: number) => `${n} étoile${n > 1 ? "s" : ""}`;

export function RewardsScreen({ navigation, route }: RewardsProps) {
  const { childId, childName } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const rewardsQuery = useRewards(childId);
  const starsQuery = useBarkleyStars(childId);
  const claim = useClaimReward(childId);
  const logsQuery = useBarkleyTodayLogs(childId);
  const logBehavior = useLogBarkleyBehavior(childId);

  const [claimErrorId, setClaimErrorId] = useState<string | null>(null);

  const rewards = rewardsQuery.data ?? [];
  const availableStars = starsQuery.data?.availableStars ?? 0;
  const goal = rewardGoal(rewards, availableStars);

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
        title={childName ? copy.boardTitle(childName) : copy.title}
        subtitle={copy.boardSubtitle}
        onBack={backIfPushed(navigation)}
      />

      {starsQuery.data ? (
        <View style={styles.hero}>
          <View style={styles.heroMo}>
            <Mo state="theme-recompenses" size={96} />
          </View>
          <Text style={styles.heroKicker} importantForAccessibility="no" accessibilityElementsHidden>
            {copy.heroKicker}
          </Text>
          <View
            style={styles.heroRow}
            accessible
            accessibilityRole="header"
            accessibilityLabel={`${availableStars} ${copy.starsAvailable(availableStars)}`}
          >
            <Text style={styles.heroNumber}>{availableStars}</Text>
            <MoIcon name="encourager" size={34} />
          </View>
          <Text style={styles.heroLabel} importantForAccessibility="no" accessibilityElementsHidden>
            {copy.starsAvailable(availableStars)}
          </Text>
          {goal ? (
            <View style={styles.goal}>
              <Text style={styles.goalText}>
                {goal.kind === "next"
                  ? copy.goalNext(goal.missing, goal.reward.name)
                  : copy.goalReady(goal.reward.name)}
              </Text>
              {goal.kind === "next" ? (
                <View
                  style={styles.goalTrack}
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={copy.goalProgress(goal.reward.name)}
                  accessibilityValue={{ min: 0, max: goal.reward.starsRequired, now: availableStars }}
                >
                  <View style={[styles.goalFill, { width: `${Math.round(goal.progress * 100)}%` }]} />
                </View>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.heroLedger}>
            {copy.earned} {starsQuery.data.totalStars} · {copy.spent} {starsQuery.data.spentStars}
          </Text>
        </View>
      ) : null}

      {behaviors.length > 0 ? (
        <>
          <SectionLabel>Gagner des étoiles</SectionLabel>
          {starsQuery.data ? (
            <Text style={styles.week}>{behaviorTracking.starsThisWeek(starsQuery.data.weeklyStars)}</Text>
          ) : null}
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
                accessibilityRole="checkbox"
                accessibilityLabel={`${b.name}, +${stars(b.points)}`}
                accessibilityState={{ checked: done, busy: isPending }}
              >
                <Card style={[styles.behaviorCard, done && styles.behaviorDone]}>
                  <View style={[styles.check, done && styles.checkDone]}>
                    {done ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
                  </View>
                  <ItemIcon spec={iconFor({ label: b.name, emoji: b.icon, kind: "behavior" })} size={28} />
                  <Text style={[styles.behaviorName, done && styles.behaviorNameDone]}>
                    {b.name}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>+{b.points}</Text>
                    <MoIcon name="encourager" size={16} />
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
            mo="enquete-boite"
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
                  <ItemIcon
                    spec={iconFor({ label: reward.name, emoji: reward.icon, kind: "reward" })}
                    size={40}
                    fallback={reward.name}
                  />
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <View style={styles.costRow}>
                      <Text style={styles.costText}>
                        {stars(reward.starsRequired)} nécessaire{reward.starsRequired > 1 ? "s" : ""}
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
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canClaim || isPending || claim.isPending }}
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
                        : `Encore ${stars(reward.starsRequired - availableStars)} à gagner`}
                  </Text>
                </Pressable>
              </Card>
            );
          })}

          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync(`${WEB_URL}/rewards`)
            }
            accessibilityRole="link"
            style={styles.webLinkHit}
          >
            <Text style={styles.webLink}>
              Gérer les récompenses sur le site ›
            </Text>
          </Pressable>

          <DailyMoTip context="rewards" />
        </>
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    hero: {
      backgroundColor: c.surfaceHoney,
      borderRadius: 28,
      padding: 18,
      gap: 4,
      overflow: "hidden",
    },
    heroMo: { position: "absolute", right: 6, bottom: 4 },
    heroKicker: { fontFamily: fonts.hand, fontSize: 21, color: c.alertFg },
    heroRow: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
    heroNumber: { fontSize: 40, lineHeight: 46, fontFamily: fonts.heading, color: c.text },
    heroLabel: { fontSize: 14, fontFamily: fonts.body, color: c.muted },
    goal: { gap: 8, marginTop: 8, paddingRight: 104 },
    goalText: { fontSize: 15, lineHeight: 21, fontFamily: fonts.medium, color: c.text },
    goalTrack: {
      height: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.alertBorder,
      backgroundColor: c.card,
      overflow: "hidden",
    },
    goalFill: { height: "100%", borderRadius: 999, backgroundColor: "#d8b865" },
    heroLedger: { marginTop: 8, fontSize: 12, fontFamily: fonts.body, color: c.muted, paddingRight: 104 },
    week: { fontSize: 14, fontFamily: fonts.medium, color: c.subtext },
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
    behaviorName: { flex: 1, fontSize: 16, color: c.text, fontFamily: fonts.medium },
    behaviorNameDone: { color: c.successFg },
    pointsBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
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
    rewardInfo: { flex: 1, gap: 4 },
    rewardName: {
      fontSize: 16,
      fontFamily: fonts.semibold,
      color: c.text,
    },
    costRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    costText: { fontSize: 13, fontFamily: fonts.body, color: c.subtext },
    claimedBadge: {
      fontSize: 12,
      color: c.successFg,
      fontFamily: fonts.medium,
      backgroundColor: c.successSurface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    claimButton: {
      backgroundColor: c.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    claimButtonDisabled: {
      backgroundColor: c.border,
    },
    claimText: {
      color: c.onPrimary,
      fontSize: 15,
      fontFamily: fonts.semibold,
    },
    claimTextDisabled: {
      color: c.muted,
    },
    webLinkHit: { minHeight: 44, justifyContent: "center" },
    webLink: {
      color: c.brandStrong,
      fontSize: 14,
      fontFamily: fonts.body,
      textAlign: "center",
      paddingVertical: 8,
    },
  });
