import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TIME_OF_DAY, type TimeOfDay } from "@focusflow/validators";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";

import {
  Button,
  Card,
  ErrorNote,
  Loader,
  Screen,
  ScreenHeader,
  SectionLabel,
  confirmDelete,
  fonts,
} from "../components/ui";
import {
  DOW_LABELS,
  TIME_OF_DAY_LABELS,
  editRoutine as copy,
} from "../lib/copy";
import { useTheme, type Palette } from "../lib/theme";
import {
  useDeleteRoutine,
  useRoutines,
  useUpdateRoutine,
  useUpsertRoutineSteps,
} from "../hooks/use-routines";
import type { EditRoutineProps } from "../navigation/types";

type StepDraft = {
  id?: string;
  label: string;
  emoji: string;
  minutes: string;
};

// Full routine editor on mobile (name, emoji, moment, days, steps). Metadata
// and steps are saved via two endpoints; steps are reordered with explicit
// up/down controls rather than drag — clearer and accessible for ADHD users.
export function EditRoutineScreen({ navigation, route }: EditRoutineProps) {
  const { childId, childName, routineId } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const routinesQuery = useRoutines(childId);
  const routine = routinesQuery.data?.find((r) => r.id === routineId);

  const updateRoutine = useUpdateRoutine();
  const upsertSteps = useUpsertRoutineSteps();
  const deleteRoutine = useDeleteRoutine();

  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [days, setDays] = useState<number[]>([]);
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [error, setError] = useState(false);

  // Populate the form once the routine is loaded (only the first time).
  useEffect(() => {
    if (ready || !routine) return;
    setName(routine.name);
    setEmoji(routine.emoji ?? "");
    setTimeOfDay(routine.timeOfDay);
    setDays([...routine.daysOfWeek]);
    setSteps(
      [...routine.steps]
        .sort((a, b) => a.position - b.position)
        .map((s) => ({
          id: s.id,
          label: s.label,
          emoji: s.emoji ?? "",
          minutes: s.durationMinutes != null ? String(s.durationMinutes) : "",
        })),
    );
    setReady(true);
  }, [routine, ready]);

  const saving = updateRoutine.isPending || upsertSteps.isPending;

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  function updateStep(i: number, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }
  function moveStep(i: number, dir: -1 | 1) {
    setSteps((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }
  function addStep() {
    setSteps((prev) => [...prev, { label: "", emoji: "", minutes: "" }]);
  }

  async function save() {
    setError(false);
    const trimmedName = name.trim();
    const cleanSteps = steps
      .map((s) => ({ ...s, label: s.label.trim() }))
      .filter((s) => s.label.length > 0)
      .map((s) => {
        const m = parseInt(s.minutes, 10);
        return {
          id: s.id,
          label: s.label,
          emoji: s.emoji.trim() || null,
          durationMinutes:
            Number.isFinite(m) && m >= 1 && m <= 180 ? m : null,
        };
      });
    if (!trimmedName) {
      setError(true);
      return;
    }
    try {
      await updateRoutine.mutateAsync({
        childId,
        id: routineId,
        name: trimmedName,
        emoji: emoji.trim() || null,
        timeOfDay,
        daysOfWeek: days,
      });
      await upsertSteps.mutateAsync({
        childId,
        id: routineId,
        steps: cleanSteps,
      });
      Alert.alert(copy.saved);
      navigation.goBack();
    } catch {
      setError(true);
    }
  }

  function remove() {
    confirmDelete(() =>
      deleteRoutine.mutate(
        { childId, id: routineId },
        { onSuccess: () => navigation.goBack() },
      ),
    );
  }

  if (routinesQuery.isLoading || !ready) {
    return (
      <Screen scroll>
        <ScreenHeader
          title={copy.title}
          subtitle={childName}
          onBack={() => navigation.goBack()}
        />
        {routinesQuery.isLoading ? (
          <Loader />
        ) : (
          <ErrorNote message={copy.notFound} />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={copy.title}
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      <Card>
        <SectionLabel>{copy.name}</SectionLabel>
        <TextInput
          style={styles.input}
          placeholder={copy.namePlaceholder}
          placeholderTextColor={c.muted}
          value={name}
          onChangeText={setName}
        />
        <SectionLabel>{copy.emoji}</SectionLabel>
        <TextInput
          style={[styles.input, styles.emojiInput]}
          placeholder={copy.emojiPlaceholder}
          placeholderTextColor={c.muted}
          value={emoji}
          onChangeText={setEmoji}
        />
      </Card>

      <Card>
        <SectionLabel>{copy.timeOfDay}</SectionLabel>
        <View style={styles.pills}>
          {TIME_OF_DAY.map((t) => {
            const on = t === timeOfDay;
            return (
              <Pressable
                key={t}
                onPress={() => setTimeOfDay(t)}
                style={[styles.pill, on && styles.pillOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.pillText, on && styles.pillTextOn]}>
                  {TIME_OF_DAY_LABELS[t] ?? t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionLabel>{copy.days}</SectionLabel>
        <View style={styles.daysRow}>
          {DOW_LABELS.map((label, d) => {
            const on = days.includes(d);
            return (
              <Pressable
                key={d}
                onPress={() => toggleDay(d)}
                style={[styles.dayChip, on && styles.dayChipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`Jour ${label}`}
              >
                <Text style={[styles.dayText, on && styles.dayTextOn]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>{copy.daysHint}</Text>
      </Card>

      <SectionLabel>{copy.steps}</SectionLabel>
      {steps.map((step, i) => (
        <Card key={step.id ?? `new-${i}`}>
          <View style={styles.stepTop}>
            <TextInput
              style={[styles.input, styles.stepEmoji]}
              placeholder={copy.stepEmojiPlaceholder}
              placeholderTextColor={c.muted}
              value={step.emoji}
              onChangeText={(v) => updateStep(i, { emoji: v })}
            />
            <TextInput
              style={[styles.input, styles.stepLabel]}
              placeholder={copy.stepPlaceholder}
              placeholderTextColor={c.muted}
              value={step.label}
              onChangeText={(v) => updateStep(i, { label: v })}
            />
            <Pressable
              onPress={() => removeStep(i)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Supprimer l'étape"
              hitSlop={6}
            >
              <X size={18} color={c.muted} />
            </Pressable>
          </View>
          <View style={styles.stepBottom}>
            <TextInput
              style={[styles.input, styles.stepMin]}
              placeholder={copy.stepMinutesPlaceholder}
              placeholderTextColor={c.muted}
              value={step.minutes}
              onChangeText={(v) =>
                updateStep(i, { minutes: v.replace(/[^0-9]/g, "") })
              }
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.minLabel}>min</Text>
            <View style={styles.spacer} />
            <Pressable
              onPress={() => moveStep(i, -1)}
              disabled={i === 0}
              style={[styles.iconBtn, i === 0 && styles.iconDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Monter l'étape"
              hitSlop={6}
            >
              <ChevronUp size={20} color={c.subtext} />
            </Pressable>
            <Pressable
              onPress={() => moveStep(i, 1)}
              disabled={i === steps.length - 1}
              style={[
                styles.iconBtn,
                i === steps.length - 1 && styles.iconDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Descendre l'étape"
              hitSlop={6}
            >
              <ChevronDown size={20} color={c.subtext} />
            </Pressable>
          </View>
        </Card>
      ))}

      <Button
        label={copy.addStep}
        variant="secondary"
        icon={<Plus size={18} color={c.text} />}
        onPress={addStep}
      />

      {error ? <ErrorNote message={copy.error} /> : null}

      <Button
        label={saving ? copy.saving : copy.save}
        onPress={save}
        loading={saving}
        disabled={!name.trim()}
      />

      <Pressable
        onPress={remove}
        style={styles.deleteRow}
        accessibilityRole="button"
        accessibilityLabel={copy.deleteRoutine}
        disabled={deleteRoutine.isPending}
      >
        <Trash2 size={18} color={c.danger} />
        <Text style={styles.deleteText}>{copy.deleteRoutine}</Text>
      </Pressable>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.bg,
      fontFamily: fonts.body,
    },
    emojiInput: { width: 80, textAlign: "center", fontSize: 20 },
    pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillOn: { backgroundColor: c.brand, borderColor: c.brand },
    pillText: { color: c.subtext, fontFamily: fonts.medium, fontSize: 14 },
    pillTextOn: { color: "#fff", fontFamily: fonts.semibold },
    daysRow: { flexDirection: "row", gap: 8 },
    dayChip: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    dayChipOn: { backgroundColor: c.brand, borderColor: c.brand },
    dayText: { color: c.subtext, fontFamily: fonts.semibold, fontSize: 14 },
    dayTextOn: { color: "#fff" },
    hint: { fontSize: 12, color: c.muted, fontFamily: fonts.body },
    stepTop: { flexDirection: "row", alignItems: "center", gap: 8 },
    stepEmoji: { width: 52, textAlign: "center", fontSize: 18 },
    stepLabel: { flex: 1 },
    stepBottom: { flexDirection: "row", alignItems: "center", gap: 6 },
    stepMin: { width: 64, textAlign: "center" },
    minLabel: { color: c.muted, fontFamily: fonts.body, fontSize: 13 },
    spacer: { flex: 1 },
    iconBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    iconDisabled: { opacity: 0.3 },
    deleteRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      marginTop: 4,
    },
    deleteText: { color: c.danger, fontFamily: fonts.semibold, fontSize: 15 },
  });
