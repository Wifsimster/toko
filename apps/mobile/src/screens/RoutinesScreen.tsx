import { useMemo } from "react";
import type { Routine, RoutineStep } from "@focusflow/validators";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

import {
  Button,
  Card,
  EmptyState,
  Loader,
  Screen,
  ScreenHeader,
  SectionLabel,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
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

export function RoutinesScreen({ navigation, route }: RoutinesProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";
  const today = todayISO();
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const goAdd = () =>
    navigation.navigate("AddRoutine", { childId, childName });

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
      <ScreenHeader
        title={copy.title}
        subtitle={childName}
        right={
          childId ? (
            <Pressable
              onPress={goAdd}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={copy.add}
            >
              <Text style={styles.add}>+ Ajouter</Text>
            </Pressable>
          ) : undefined
        }
      />
      <SectionLabel>{copy.today}</SectionLabel>

      {routinesQuery.isLoading ? (
        <Loader />
      ) : todays.length === 0 ? (
        <>
          <EmptyState title={copy.noneToday} body={copy.authorHint} />
          {childId ? (
            <Button
              label={copy.add}
              icon={<Plus size={18} color="#fff" />}
              onPress={goAdd}
            />
          ) : null}
        </>
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    add: { color: c.action, fontSize: 15, fontFamily: fonts.semibold },
    head: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: { fontSize: 17, color: c.text, fontFamily: fonts.semibold, flexShrink: 1 },
    progress: { fontSize: 14, color: c.muted, fontFamily: fonts.medium },
    allDone: { color: c.success, fontFamily: fonts.medium },
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
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: { backgroundColor: c.success, borderColor: c.success },
    check: { color: "#fff", fontSize: 16, fontFamily: fonts.bold },
    stepLabel: { flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.body },
    stepLabelDone: { color: c.chevron, textDecorationLine: "line-through" },
    duration: { fontSize: 13, color: c.muted, fontFamily: fonts.medium },
  });
