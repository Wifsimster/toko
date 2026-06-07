import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
} from "../components/ui";
import {
  PeriodSwitcher,
  type StatsPeriod,
} from "../components/period-switcher";
import { PremiumGate } from "../components/premium-gate";
import { useTheme, type Palette } from "../lib/theme";
import { useCorrelations, useInsights } from "../hooks/use-insights";
import { usePremium } from "../hooks/use-billing";
import { WEB_URL } from "../lib/config";
import type { InsightsProps } from "../navigation/types";

const PERIOD_TITLE: Record<StatsPeriod, string> = {
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function moodTrendLabel(trend: "up" | "down" | "stable" | null): string {
  if (trend === "up") return "En hausse";
  if (trend === "down") return "En baisse";
  if (trend === "stable") return "Stable";
  return "—";
}

function moodTrendColor(
  trend: "up" | "down" | "stable" | null,
  c: Palette,
): string {
  if (trend === "up") return c.success;
  if (trend === "down") return c.danger;
  return c.muted;
}

function scoreColor(value: number, c: Palette): string {
  if (value >= 70) return c.success;
  if (value >= 40) return "#d97706"; // amber — keep semantic
  return c.danger;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  valueColor,
  styles,
}: {
  label: string;
  value: string;
  valueColor?: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

function ConsistencyBar({
  score,
  c,
  styles,
}: {
  score: number;
  c: Palette;
  styles: ReturnType<typeof makeStyles>;
}) {
  const width = `${Math.min(100, Math.max(0, score))}%` as `${number}%`;
  const color = scoreColor(score, c);
  return (
    <View style={styles.consistencyWrap}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={[styles.consistencyPct, { color }]}>{score} %</Text>
    </View>
  );
}

function MoodGrid({
  symptoms,
  c,
  styles,
}: {
  symptoms: Array<{ date: string; mood: number }>;
  c: Palette;
  styles: ReturnType<typeof makeStyles>;
}) {
  // Show max last 7 data points as a compact inline view
  const points = symptoms.slice(-7);
  if (points.length === 0) return null;
  return (
    <View style={styles.moodGrid}>
      {points.map((s) => {
        const col =
          s.mood >= 7 ? c.success : s.mood >= 4 ? "#d97706" : c.danger;
        return (
          <View key={s.date} style={styles.moodCell}>
            <View style={[styles.moodDot, { backgroundColor: col }]} />
            <Text style={styles.moodScore}>{s.mood}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function InsightsScreen({ navigation, route }: InsightsProps) {
  const { childId, childName } = route.params;
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const { isPremium } = usePremium();
  const stats = useInsights(childId, period);
  const correlations = useCorrelations(childId, { enabled: isPremium });
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const isLoading = stats.isLoading;
  const isError = stats.isError;
  const data = stats.data;

  return (
    <Screen scroll>
      <ScreenHeader
        title="Aperçu"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      <PeriodSwitcher
        value={period}
        onChange={setPeriod}
        isPremium={isPremium}
        onLocked={() =>
          Alert.alert(
            "Réservé au plan Famille",
            "Les périodes Mois et Trimestre font partie du plan Famille, qui se gère depuis votre espace Tokō sur le site web.",
          )
        }
      />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <>
          <ErrorNote message="Impossible de charger les données. Vérifiez votre connexion." />
          <PrimaryButton
            label="Voir le détail sur le site"
            onPress={() =>
              WebBrowser.openBrowserAsync(`${WEB_URL}/insights`)
            }
          />
        </>
      ) : !data ? (
        <EmptyState
          title="Aucune donnée"
          body="Les statistiques apparaîtront après quelques jours d'observations."
        />
      ) : (
        <>
          {/* Disclaimer */}
          <Card style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              Ces données sont indicatives. Elles ne remplacent pas l'avis d'un professionnel de santé.
            </Text>
          </Card>

          {/* Suivi sur la période */}
          <Card>
            <Text style={styles.sectionTitle}>{PERIOD_TITLE[period]}</Text>
            <StatRow
              label="Observations enregistrées"
              value={String(data.symptoms.length)}
              styles={styles}
            />
            <StatRow
              label="Série de jours consécutifs"
              value={data.streak > 0 ? `${data.streak} jour${data.streak > 1 ? "s" : ""}` : "—"}
              valueColor={data.streak >= 3 ? c.success : undefined}
              styles={styles}
            />
            {data.daysSinceLastEntry !== null ? (
              <StatRow
                label="Dernier enregistrement"
                value={
                  data.daysSinceLastEntry === 0
                    ? "Aujourd'hui"
                    : data.daysSinceLastEntry === 1
                    ? "Hier"
                    : `Il y a ${data.daysSinceLastEntry} jours`
                }
                valueColor={
                  data.daysSinceLastEntry > 3 ? c.danger : undefined
                }
                styles={styles}
              />
            ) : null}
            <StatRow
              label="Étoiles Barkley (7 jours)"
              value={data.weeklyStars > 0 ? `${data.weeklyStars} ⭐` : "—"}
              valueColor={data.weeklyStars > 0 ? c.success : undefined}
              styles={styles}
            />
          </Card>

          {/* Humeur */}
          <Card>
            <Text style={styles.sectionTitle}>Humeur</Text>
            {data.latestMood !== null ? (
              <StatRow
                label="Dernière humeur"
                value={`${data.latestMood} / 10`}
                valueColor={
                  data.latestMood >= 7
                    ? c.success
                    : data.latestMood <= 3
                    ? c.danger
                    : c.muted
                }
                styles={styles}
              />
            ) : null}
            <StatRow
              label="Tendance"
              value={moodTrendLabel(data.moodTrend)}
              valueColor={moodTrendColor(data.moodTrend, c)}
              styles={styles}
            />
            {data.symptoms.length > 0 ? (
              <>
                <Text style={styles.miniLabel}>7 derniers points d'humeur</Text>
                <MoodGrid symptoms={data.symptoms} c={c} styles={styles} />
              </>
            ) : null}
          </Card>

          {/* Score de régularité */}
          {data.consistencyScore !== null ? (
            <Card>
              <Text style={styles.sectionTitle}>Régularité</Text>
              <Text style={styles.helpText}>
                Combine la couverture des jours et la stabilité des scores.
              </Text>
              <ConsistencyBar score={data.consistencyScore} c={c} styles={styles} />
            </Card>
          ) : null}

          {/* Corrélation comportements — réservé au plan Famille (mirroir web) */}
          <PremiumGate
            previewTitle="Comportement & bien-être"
            previewBody="Découvrez quels comportements du programme Barkley améliorent le plus l'humeur et l'attention de votre enfant."
          >
            {!correlations.isLoading && correlations.data ? (
              <Card>
                <Text style={styles.sectionTitle}>Comportement & bien-être</Text>
                {correlations.data.insufficientData ? (
                  <Text style={styles.helpText}>
                    Pas encore assez de données (min. 10 observations + comportements Barkley actifs sur 4 semaines).
                  </Text>
                ) : (
                  <>
                    <Text style={styles.helpText}>
                      Quand{" "}
                      <Text style={styles.bold}>
                        {correlations.data.insight.behaviorName}
                      </Text>{" "}
                      est complété, {correlations.data.insight.dimensionLabel} s'améliore
                      de{" "}
                      <Text style={[styles.bold, { color: c.success }]}>
                        +{correlations.data.insight.delta}
                      </Text>{" "}
                      pts en moyenne.
                    </Text>
                    <View style={styles.correlRow}>
                      <View style={styles.correlBlock}>
                        <Text style={styles.correlNum}>
                          {correlations.data.insight.onValue}
                        </Text>
                        <Text style={styles.correlLeg}>Avec</Text>
                      </View>
                      <Text style={styles.correlArrow}>→</Text>
                      <View style={styles.correlBlock}>
                        <Text style={styles.correlNum}>
                          {correlations.data.insight.offValue}
                        </Text>
                        <Text style={styles.correlLeg}>Sans</Text>
                      </View>
                    </View>
                  </>
                )}
              </Card>
            ) : null}
          </PremiumGate>

          {/* Link to web for full charts */}
          <PrimaryButton
            label="Voir les graphiques sur le site"
            onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/insights`)}
          />
        </>
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    disclaimerCard: {
      backgroundColor: c.infoSurface,
      borderColor: c.infoBorder,
    },
    disclaimerText: {
      fontSize: 13,
      color: c.infoFg,
      lineHeight: 18,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: c.text,
    },
    helpText: {
      fontSize: 13,
      color: c.muted,
      lineHeight: 18,
    },
    bold: {
      fontWeight: "700",
    },
    miniLabel: {
      fontSize: 12,
      color: c.muted,
      marginTop: 4,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    statLabel: {
      fontSize: 14,
      color: c.subtext,
      flex: 1,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
    consistencyWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
    },
    barTrack: {
      flex: 1,
      height: 10,
      backgroundColor: c.border,
      borderRadius: 999,
      overflow: "hidden",
    },
    barFill: {
      height: 10,
      borderRadius: 999,
    },
    consistencyPct: {
      fontSize: 14,
      fontWeight: "700",
      width: 44,
      textAlign: "right",
    },
    moodGrid: {
      flexDirection: "row",
      gap: 6,
      marginTop: 4,
      flexWrap: "wrap",
    },
    moodCell: {
      alignItems: "center",
      gap: 2,
    },
    moodDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    moodScore: {
      fontSize: 11,
      color: c.muted,
      fontWeight: "600",
    },
    correlRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      marginTop: 8,
    },
    correlBlock: {
      alignItems: "center",
      gap: 2,
    },
    correlNum: {
      fontSize: 22,
      fontWeight: "700",
      color: c.text,
    },
    correlLeg: {
      fontSize: 12,
      color: c.muted,
    },
    correlArrow: {
      fontSize: 22,
      color: c.muted,
    },
  });
