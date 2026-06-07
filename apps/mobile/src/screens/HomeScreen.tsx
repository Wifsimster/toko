import { useEffect, useMemo } from "react";
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
import { reconcileLocalReminders } from "../lib/notifications";
import { loadPhoneReminderPrefs } from "../hooks/use-phone-reminders";
import { usePreferences } from "../hooks/use-preferences";
import { useInsights } from "../hooks/use-insights";
import { useCalmMinutes } from "../hooks/use-stats";
import { useParentMood, useUpsertParentMood } from "../hooks/use-parent-mood";
import { pickNextArticle, useReadArticles } from "../lib/reading";
import type { HomeProps, RootTabParamList } from "../navigation/types";

const MOODS = [
  { score: 1, emoji: "😣", label: "Épuisé(e)" },
  { score: 2, emoji: "😟", label: "Fatigué(e)" },
  { score: 3, emoji: "😐", label: "Neutre" },
  { score: 4, emoji: "🙂", label: "Ça va" },
  { score: 5, emoji: "😄", label: "En forme" },
];

// Deterministic daily rotation — a calm, guilt-free tip that changes each day.
const TIPS = [
  "Une consigne à la fois, regard dans les yeux. Les longues phrases se perdent dans un cerveau TDAH.",
  "Avant d'exiger, prévenez : « Dans 5 minutes, on range. » La transition est le moment difficile.",
  "Un comportement difficile est souvent une compétence qui manque, pas une provocation.",
  "Votre calme est contagieux. Respirez avant de parler — son système nerveux suit le vôtre.",
  "Nommez la réussite à voix haute : « Tu as rangé tout seul. » Le cerveau TDAH a soif de feedback positif.",
  "Les routines visibles fatiguent moins la mémoire. Une image vaut dix rappels.",
  "Après une crise, réparez à froid le lendemain — pas d'explication à chaud.",
];

function greeting(h: number) {
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bel après-midi";
  return "Bonne soirée";
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
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
  const prefs = usePreferences();

  // Keep the OS-scheduled phone reminders fresh on every launch, honouring the
  // device's phone opt-ins and the account's reminder times. Idempotent — the
  // Réglages screen reconciles the same way on change.
  useEffect(() => {
    if (!prefs.data) return;
    const { morningReminderTime, eveningReminderTime } = prefs.data;
    let cancelled = false;
    void loadPhoneReminderPrefs().then((phone) => {
      if (cancelled) return;
      void reconcileLocalReminders({
        morning: { enabled: phone.morningPhone, time: morningReminderTime },
        evening: { enabled: phone.eveningPhone, time: eveningReminderTime },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [prefs.data]);

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
              <Text style={styles.moodDone}>
                {MOODS.find((m) => m.score === todaysMood.score)?.emoji} Humeur
                du jour enregistrée. Prenez soin de vous.
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
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
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
                    value={s ? `${s.streak >= 3 ? "🔥 " : ""}${s.streak}` : "—"}
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
            <Text style={styles.actionEmoji}>{isEvening ? "🌙" : "📋"}</Text>
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

          {/* Daily tip */}
          <CalloutCard variant="tip" label="Conseil du jour">
            <Text style={styles.calloutBody}>{TIPS[dayOfYear() % TIPS.length]}</Text>
          </CalloutCard>

          {/* Next reading — next unread knowledge article */}
          {nextArticle ? (
            <Pressable
              onPress={() => goArticle(nextArticle.slug, nextArticle.title)}
              accessibilityRole="button"
            >
              <Card>
                <Text style={styles.readingLabel}>📖 Prochaine lecture</Text>
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
    greeting: { fontSize: 26, color: c.text, fontFamily: fonts.heading },
    sub: { fontSize: 15, color: c.muted, fontFamily: fonts.body },
    flex1: { flex: 1 },
    calloutBody: { fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    moodDone: { fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    moodRow: { flexDirection: "row", justifyContent: "space-between" },
    moodBtn: {
      width: 52,
      height: 52,
      borderRadius: 12,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    moodEmoji: { fontSize: 26 },
    cardTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    kpis: { flexDirection: "row", marginVertical: 4 },
    kpi: { flex: 1, alignItems: "center" },
    kpiValue: { fontSize: 22, color: c.brand, fontFamily: fonts.bold },
    kpiLabel: { fontSize: 11, color: c.muted, fontFamily: fonts.body, marginTop: 2 },
    link: { color: c.action, fontFamily: fonts.semibold, fontSize: 14 },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.brand,
      borderRadius: 14,
      padding: 18,
    },
    actionEmoji: { fontSize: 28 },
    actionTitle: { color: "#fff", fontSize: 17, fontFamily: fonts.semibold },
    actionHint: { color: "#ffffffcc", fontSize: 13, fontFamily: fonts.body, marginTop: 2 },
    actionChevron: { color: "#fff", fontSize: 24 },
    readingLabel: { color: c.muted, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
    readingTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 16 },
    readingMeta: { color: c.muted, fontFamily: fonts.body, fontSize: 13 },
  });
