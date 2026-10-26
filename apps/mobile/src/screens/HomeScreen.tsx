import { useMemo } from "react";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  CalloutCard,
  ChildSwitcher,
  EmptyState,
  Loader,
  Screen,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { DailyChecklist, MedicationQuickLog } from "../components/home-widgets";
import { MoTip } from "../components/mo/mo-tip";
import { MoodFace, PARENT_MOODS } from "../components/mo/mood-face";
import { Picto } from "../components/mo/companion";
import { MoIcon } from "../components/item-icon";
import { moTipOfTheDay } from "../lib/mo-tips";
import { useInsights } from "../hooks/use-insights";
import { useCalmMinutes } from "../hooks/use-stats";
import { useParentMood, useUpsertParentMood } from "../hooks/use-parent-mood";
import { pickNextArticle, useReadArticles } from "../lib/reading";
import type { HomeProps, RootTabParamList } from "../navigation/types";

// Mood picker: Mō faces (the one place several Mō may share a screen), same
// score → state table as the web.
const MOODS = PARENT_MOODS;

function greeting(h: number) {
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bel après-midi";
  return "Bonne soirée";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function HomeScreen({ navigation }: HomeProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { active, isLoading } = useActiveChild();
  const { data: session } = authClient.useSession();
  const hour = new Date().getHours();

  // Reminder reconciliation now runs at the authed root (useReminderSync in
  // App.tsx) so it fires for both the full port and the companion.

  const childId = active?.id ?? "";
  const insights = useInsights(childId, "week");
  const calm = useCalmMinutes(childId, "week");
  const mood = useParentMood(1);
  const upsertMood = useUpsertParentMood();
  const reading = useReadArticles();
  const nextArticle = reading.loaded ? pickNextArticle(reading.read) : null;

  const firstName = session?.user?.name?.split(" ")[0];
  const todaysMood = mood.data?.find((m) => m.date.slice(0, 10) === todayISO());

  function tab() {
    return navigation.getParent<BottomTabNavigationProp<RootTabParamList>>();
  }
  function goCheckin() {
    if (!active) return;
    (tab() as any)?.navigate("SymptomesTab", {
      screen: "Checkin",
      params: { childId: active.id, childName: active.name },
    });
  }
  function goRoutines() {
    (tab() as any)?.navigate("RoutinesTab");
  }
  function goSymptoms() {
    (tab() as any)?.navigate("SymptomesTab");
  }
  function goArticle(slug: string, title: string) {
    reading.markRead(slug);
    (tab() as any)?.navigate("PlusTab", {
      screen: "ConnaissancesArticle",
      params: { slug, title },
    });
  }

  const s = insights.data;
  const daysSince = s?.daysSinceLastEntry ?? null;
  const isEvening = hour >= 17;
  const dailyTip = moTipOfTheDay("home");

  return (
    <Screen scroll>
      {/* Greeting */}
      <View style={{ gap: 2 }}>
        <Text style={styles.greeting}>
          {firstName ? `${greeting(hour)} ${firstName}` : greeting(hour)}
        </Text>
        <Text style={styles.sub}>
          {active ? `Suivi de ${active.name}` : "Vue d'ensemble"}
        </Text>
      </View>
      <ChildSwitcher />

      {isLoading ? (
        <Loader />
      ) : !active ? (
        <EmptyState
          mo
          title="Aucun enfant pour l'instant"
          body="Ajoutez un enfant depuis le site, il apparaîtra ici."
        />
      ) : (
        <>
          {/* Parent mood — 1 tap */}
          <CalloutCard
            variant="info"
            label="Et vous, comment ça va ?"
          >
            {todaysMood ? (
              // No face once saved: the daily tip below is this screen's Mō.
              <Text style={styles.moodDone}>
                Humeur du jour enregistrée. Prenez soin de vous.
              </Text>
            ) : (
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <Pressable
                    key={m.score}
                    accessibilityRole="button"
                    accessibilityLabel={m.label}
                    style={styles.moodBtn}
                    onPress={() =>
                      upsertMood.mutate({ date: todayISO(), score: m.score })
                    }
                  >
                    <MoodFace state={m.state} size={40} />
                    <Text style={styles.moodLabel} numberOfLines={1}>
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </CalloutCard>

          {/* Child at-a-glance */}
          {daysSince != null && daysSince >= 2 ? (
            <CalloutCard variant="alert" label={`${daysSince} jours sans relevé`}>
              <Text style={styles.calloutBody}>
                Notez la soirée de {active.name} pour reprendre le fil.
              </Text>
              <Pressable onPress={goCheckin} accessibilityRole="button">
                <Text style={styles.link}>Faire le point du soir ›</Text>
              </Pressable>
            </CalloutCard>
          ) : (
            <Pressable onPress={goSymptoms} accessibilityRole="button">
              <Card>
                <Text style={styles.cardTitle}>Cette semaine</Text>
                <View style={styles.kpis}>
                  <Kpi
                    value={s ? `${s.streak}` : "—"}
                    label="jours de suite"
                  />
                  <Kpi value={s ? `${s.weeklyStars}` : "—"} label="étoiles" />
                  <Kpi
                    value={calm.data ? `${calm.data.totalMinutes}` : "—"}
                    label="min calmes"
                  />
                </View>
                <Text style={styles.link}>Voir le suivi ›</Text>
              </Card>
            </Pressable>
          )}

          {/* Time-aware primary action */}
          <Pressable
            onPress={isEvening ? goCheckin : goRoutines}
            accessibilityRole="button"
            style={styles.action}
          >
            <View style={styles.actionIcon}>
              <MoIcon name={isEvening ? "couchers" : "matins"} size={30} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.actionTitle}>
                {isEvening ? "Point du soir" : "Routines du jour"}
              </Text>
              <Text style={styles.actionHint}>
                {isEvening
                  ? "2 taps, 10 secondes"
                  : "Rendre la journée prévisible"}
              </Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </Pressable>

          {/* Live "done today" checklist + 1-tap medication log */}
          <DailyChecklist childId={childId} />
          <MedicationQuickLog childId={childId} />

          {/* Daily tip, delivered by Mō (the only Mō on this screen) */}
          {dailyTip ? <MoTip label="Conseil du jour" tip={dailyTip} /> : null}

          {/* Next reading — next unread knowledge article */}
          {nextArticle ? (
            <Pressable
              onPress={() => goArticle(nextArticle.slug, nextArticle.title)}
              accessibilityRole="button"
            >
              <Card>
                <View style={styles.readingHead}>
                  <Picto name="livre" size={22} />
                  <Text style={styles.readingLabel}>Prochaine lecture</Text>
                </View>
                <Text style={styles.readingTitle}>{nextArticle.title}</Text>
                <Text style={styles.readingMeta}>
                  {nextArticle.readTime} de lecture · Lire ›
                </Text>
              </Card>
            </Pressable>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.kpi}>
      <Text style={s.kpiValue}>{value}</Text>
      <Text style={s.kpiLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    greeting: { fontSize: 26, color: c.text, fontFamily: fonts.heading, letterSpacing: -0.65 },
    sub: { fontSize: 15, color: c.muted, fontFamily: fonts.body },
    flex1: { flex: 1 },
    calloutBody: { fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    moodDone: { fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    moodRow: { flexDirection: "row", justifyContent: "space-between" },
    moodBtn: {
      width: 58,
      minHeight: 52,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    moodLabel: { fontSize: 10, color: c.subtext, fontFamily: fonts.medium },
    cardTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    kpis: { flexDirection: "row", marginVertical: 4 },
    kpi: { flex: 1, alignItems: "center" },
    kpiValue: { fontSize: 22, color: c.brandStrong, fontFamily: fonts.bold },
    kpiLabel: { fontSize: 11, color: c.muted, fontFamily: fonts.body, marginTop: 2 },
    link: { color: c.brandStrong, fontFamily: fonts.semibold, fontSize: 14 },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.primary,
      borderRadius: 14,
      padding: 18,
    },
    // Cream disc: the drawings' ink outline needs a light ground on the ink button.
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.onPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTitle: { color: c.onPrimary, fontSize: 17, fontFamily: fonts.semibold },
    actionHint: { color: c.onPrimary, opacity: 0.8, fontSize: 13, fontFamily: fonts.body, marginTop: 2 },
    actionChevron: { color: c.onPrimary, fontSize: 24 },
    readingHead: { flexDirection: "row", alignItems: "center", gap: 6 },
    readingLabel: { color: c.muted, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
    readingTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 16 },
    readingMeta: { color: c.muted, fontFamily: fonts.body, fontSize: 13 },
  });
