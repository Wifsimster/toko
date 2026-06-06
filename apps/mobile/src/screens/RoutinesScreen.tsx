import type { Routine, RoutineStep } from "@focusflow/validators";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  Loader,
  Screen,
  ScreenHeader,
  SectionLabel,
  colors,
  fonts,
} from "../components/ui";
import { routines as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import {
  useCompleteStep,
  useRoutineCompletions,
  useRoutines,
  useUncompleteStep,
} from "../hooks/use-routines";
import { useActiveChild } from "../lib/active-child";
import type { RoutinesProps } from "../navigation/types";

// Web stores days as 0=Mon..6=Sun; JS getDay() is 0=Sun..6=Sat.
function mondayBasedDow(): number {
  return (new Date().getDay() + 6) % 7;
}

export function RoutinesScreen({ route }: RoutinesProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";
  const today = todayISO();

  const routinesQuery = useRoutines(childId);
  const completionsQuery = useRoutineCompletions(childId, today);
  const completeStep = useCompleteStep();
  const uncompleteStep = useUncompleteStep();

  const dow = mondayBasedDow();
  const todays = (routinesQuery.data ?? []).filter(
    (r) => r.active && (r.daysOfWeek.length === 0 || r.daysOfWeek.includes(dow)),
  );
  const doneStepIds = new Set(
    (completionsQuery.data ?? []).map((c) => c.stepId),
  );

  function toggle(routine: Routine, step: RoutineStep) {
    const vars = { childId, routineId: routine.id, stepId: step.id, date: today };
    if (doneStepIds.has(step.id)) uncompleteStep.mutate(vars);
    else completeStep.mutate(vars);
  }

  return (
    <Screen scroll>
      <ScreenHeader title={copy.title} subtitle={childName} />
      <SectionLabel>{copy.today}</SectionLabel>

      {routinesQuery.isLoading ? (
        <Loader />
      ) : todays.length === 0 ? (
        <EmptyState title={copy.noneToday} body={copy.authorHint} />
      ) : (
        todays.map((routine) => {
          const steps = [...routine.steps].sort((a, b) => a.position - b.position);
          const doneCount = steps.filter((s) => doneStepIds.has(s.id)).length;
          const allDone = steps.length > 0 && doneCount === steps.length;
          return (
            <Card key={routine.id}>
              <View style={styles.head}>
                <Text style={styles.name}>
                  {routine.emoji ? `${routine.emoji} ` : ""}
                  {routine.name}
                </Text>
                <Text style={styles.progress}>
                  {doneCount}/{steps.length}
                </Text>
              </View>
              {allDone ? <Text style={styles.allDone}>{copy.allDone}</Text> : null}

              {steps.map((step) => {
                const done = doneStepIds.has(step.id);
                return (
                  <Pressable
                    key={step.id}
                    style={styles.step}
                    onPress={() => toggle(routine, step)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                  >
                    <View style={[styles.checkbox, done && styles.checkboxOn]}>
                      {done ? <Text style={styles.check}>✓</Text> : null}
                    </View>
                    <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                      {step.emoji ? `${step.emoji} ` : ""}
                      {step.label}
                    </Text>
                    {step.durationMinutes ? (
                      <Text style={styles.duration}>
                        {step.durationMinutes} {copy.minutes}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 17, color: colors.text, fontFamily: fonts.semibold, flexShrink: 1 },
  progress: { fontSize: 14, color: colors.muted, fontFamily: fonts.medium },
  allDone: { color: colors.success, fontFamily: fonts.medium },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d8d0c7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },
  check: { color: "#fff", fontSize: 16, fontFamily: fonts.bold },
  stepLabel: { flex: 1, fontSize: 15, color: colors.text, fontFamily: fonts.body },
  stepLabelDone: { color: "#a89e93", textDecorationLine: "line-through" },
  duration: { fontSize: 13, color: colors.muted, fontFamily: fonts.medium },
});
