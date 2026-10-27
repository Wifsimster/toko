import { useEffect, useMemo, useState } from "react";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { AppState, StyleSheet, Text, View } from "react-native";
import { pickHomeFocus, todaysRoutines, upcomingRoutine } from "@focusflow/validators";

import { EmptyState, Loader, Screen, fonts } from "../components/ui";
import { HomeFocusCard } from "../components/home-focus-card";
import {
  ChildPill,
  MedicationsRow,
  MoodPicker,
  RoutineRow,
  WeekLine,
} from "../components/home-widgets";
import { useTheme, type Palette } from "../lib/theme";
import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { home as copy } from "../lib/copy";
import { formatFrLongDate, todayISO } from "../lib/date";
import { useInsights } from "../hooks/use-insights";
import { useCalmMinutes } from "../hooks/use-stats";
import { useParentMood, useUpsertParentMood } from "../hooks/use-parent-mood";
import { useSymptoms } from "../hooks/use-symptoms";
import { useJournal } from "../hooks/use-journal";
import { useRoutineCompletions, useRoutines } from "../hooks/use-routines";
import type { HomeProps, RootTabParamList } from "../navigation/types";

function greeting(h: number) {
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bel après-midi";
  return "Bonne soirée";
}

/**
 * Accueil, option A « une seule chose » (maquette du 2026-10-26) : le salut
 * et l'enfant, l'humeur en un tap, la carte de Mō avec la seule action utile
 * du moment, puis le reste de la journée en lignes courtes. Tient sans
 * défiler sur 360 dp à la taille de texte par défaut ; avec une grande
 * police, `Screen` défile en secours.
 */
export function HomeScreen({ navigation }: HomeProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { active, isLoading } = useActiveChild();
  const { data: session } = authClient.useSession();
  // L'heure de la carte, relue quand l'accueil revient au premier plan (onglet
  // ou appli) : à 17 h, le point du soir apparaît au retour, jamais sous le doigt.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const unsubscribe = navigation.addListener("focus", refresh);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      unsubscribe();
      sub.remove();
    };
  }, [navigation]);
  const hour = now.getHours();
  const today = todayISO(now);

  const childId = active?.id ?? "";
  const insights = useInsights(childId, "week");
  const calm = useCalmMinutes(childId, "week");
  const mood = useParentMood(1);
  const upsertMood = useUpsertParentMood();
  const symptoms = useSymptoms(childId);
  const journal = useJournal(childId);
  const routinesQuery = useRoutines(childId);
  const completions = useRoutineCompletions(childId, today);

  const firstName = session?.user?.name?.split(" ")[0];
  const todaysMood = mood.data?.find((m) => m.date.slice(0, 10) === today);

  const eveningDone = (symptoms.data ?? []).some((e) => e.date === today);
  const journalDone = (journal.data ?? []).some((e) => e.date === today);
  const routines = useMemo(
    () =>
      todaysRoutines(
        routinesQuery.data ?? [],
        new Set((completions.data ?? []).map((x) => x.stepId)),
        now,
      ),
    [routinesQuery.data, completions.data, now],
  );
  const focus = pickHomeFocus({
    hour,
    daysSinceLastEntry: insights.data?.daysSinceLastEntry ?? null,
    eveningDone,
    routines,
  });
  const nextRoutine = upcomingRoutine(
    routines,
    hour,
    focus.kind === "routine" ? focus.routine.id : undefined,
  );
  // La carte attend ses données : elle ne doit pas passer d'une action à une
  // autre sous les yeux du parent.
  const focusLoading =
    insights.isLoading || symptoms.isLoading || routinesQuery.isLoading;

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

  return (
    <Screen dense>
      <View>
        <Text style={styles.greeting} accessibilityRole="header">
          {firstName ? `${greeting(hour)} ${firstName}` : greeting(hour)}
        </Text>
        <View style={styles.dateRow}>
          <Text style={styles.date}>{formatFrLongDate(now)}</Text>
          <ChildPill />
        </View>
      </View>

      {isLoading ? (
        <Loader />
      ) : !active ? (
        <EmptyState mo title={copy.noChildTitle} body={copy.noChildBody} />
      ) : (
        <>
          <MoodPicker
            todaysScore={todaysMood?.score}
            onPick={(score) => upsertMood.mutate({ date: today, score })}
          />

          {focusLoading ? (
            <Loader />
          ) : (
            <HomeFocusCard
              focus={focus}
              childName={active.name}
              eveningDone={eveningDone}
              journalDone={journalDone}
              onStart={focus.kind === "routine" ? goRoutines : goCheckin}
            />
          )}

          {/* Le reste de la journée, sans titre : la place manque à 360 dp. */}
          <View style={styles.rest}>
            <MedicationsRow childId={childId} />
            {nextRoutine ? (
              <RoutineRow routine={nextRoutine} onPress={goRoutines} />
            ) : null}
            <WeekLine
              streak={insights.data?.streak}
              stars={insights.data?.weeklyStars}
              calmMinutes={calm.data?.totalMinutes}
              onPress={goSymptoms}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    greeting: {
      fontSize: 22,
      lineHeight: 27,
      color: c.text,
      fontFamily: fonts.heading,
      letterSpacing: -0.55,
    },
    dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    date: { flexShrink: 1, fontSize: 14, color: c.muted, fontFamily: fonts.body },
    rest: { gap: 8 },
  });
