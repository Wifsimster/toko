import type { Routine, RoutineStep } from "@focusflow/validators";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { routines as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import {
  useCompleteStep,
  useRoutineCompletions,
  useRoutines,
  useUncompleteStep,
} from "../hooks/use-routines";
import type { RoutinesProps } from "../navigation/types";

// Web stores days as 0=Mon..6=Sun; JS getDay() is 0=Sun..6=Sat.
function mondayBasedDow(): number {
  return (new Date().getDay() + 6) % 7;
}

export function RoutinesScreen({ navigation, route }: RoutinesProps) {
  const { childId, childName } = route.params;
  const today = todayISO();

  const routinesQuery = useRoutines(childId);
  const completionsQuery = useRoutineCompletions(childId, today);
  const completeStep = useCompleteStep();
  const uncompleteStep = useUncompleteStep();

  const dow = mondayBasedDow();
  const todays = (routinesQuery.data ?? []).filter(
    (r) =>
      r.active && (r.daysOfWeek.length === 0 || r.daysOfWeek.includes(dow)),
  );
  const doneStepIds = new Set(
    (completionsQuery.data ?? []).map((c) => c.stepId),
  );

  function toggle(routine: Routine, step: RoutineStep) {
    const vars = {
      childId,
      routineId: routine.id,
      stepId: step.id,
      date: today,
    };
    if (doneStepIds.has(step.id)) uncompleteStep.mutate(vars);
    else completeStep.mutate(vars);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
        <Text style={styles.back}>‹ {childName}</Text>
      </Pressable>

      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.section}>{copy.today}</Text>

      {routinesQuery.isLoading ? (
        <ActivityIndicator />
      ) : todays.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.muted}>{copy.noneToday}</Text>
          <Text style={styles.hint}>{copy.authorHint}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {todays.map((routine) => {
            const steps = [...routine.steps].sort(
              (a, b) => a.position - b.position,
            );
            const doneCount = steps.filter((s) => doneStepIds.has(s.id)).length;
            const allDone = steps.length > 0 && doneCount === steps.length;
            return (
              <View key={routine.id} style={styles.routine}>
                <View style={styles.routineHeader}>
                  <Text style={styles.routineName}>
                    {routine.emoji ? `${routine.emoji} ` : ""}
                    {routine.name}
                  </Text>
                  <Text style={styles.progress}>
                    {doneCount}/{steps.length}
                  </Text>
                </View>

                {allDone ? (
                  <Text style={styles.allDone}>{copy.allDone}</Text>
                ) : null}

                {steps.map((step) => {
                  const done = doneStepIds.has(step.id);
                  return (
                    <Pressable
                      key={step.id}
                      style={styles.step}
                      onPress={() => toggle(routine, step)}
                    >
                      <View
                        style={[styles.checkbox, done && styles.checkboxOn]}
                      >
                        {done ? <Text style={styles.check}>✓</Text> : null}
                      </View>
                      <Text
                        style={[styles.stepLabel, done && styles.stepLabelDone]}
                      >
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
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  back: { color: "#4f46e5", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "600" },
  section: { fontSize: 14, color: "#71717a", textTransform: "uppercase" },
  emptyBox: { gap: 6 },
  muted: { color: "#71717a" },
  hint: { color: "#a1a1aa", fontSize: 13 },
  scroll: { gap: 16, paddingBottom: 24 },
  routine: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routineName: { fontSize: 17, fontWeight: "600", flexShrink: 1 },
  progress: { fontSize: 14, color: "#71717a" },
  allDone: { color: "#16a34a", fontWeight: "500" },
  step: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d4d4d8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  check: { color: "#fff", fontSize: 16, fontWeight: "700" },
  stepLabel: { flex: 1, fontSize: 15, color: "#27272a" },
  stepLabelDone: { color: "#a1a1aa", textDecorationLine: "line-through" },
  duration: { fontSize: 13, color: "#a1a1aa" },
});
