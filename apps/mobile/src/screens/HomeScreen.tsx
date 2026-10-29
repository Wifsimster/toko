import { useEffect, useMemo, useState } from "react";
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
import { useOpenSection } from "../navigation/tabs";
import type { HomeProps } from "../navigation/types";

function greeting(h: number) {
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bel après-midi";
  return "Bonne soirée";
}

export function HomeScreen({ navigation }: HomeProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { active, isLoading } = useActiveChild();
  const { data: session } = authClient.useSession();
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
  const focusLoading =
    insights.isLoading ||
    symptoms.isLoading ||
    routinesQuery.isLoading ||
    completions.isLoading;

  const openSection = useOpenSection(navigation);
  function goCheckin() {
    if (!active) return;
    navigation.navigate("Checkin", { childId: active.id, childName: active.name });
  }
  function goRoutines() {
    openSection("routines");
  }
  function goSymptoms() {
    openSection("symptoms");
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
