import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
  SYMPTOM_DIMENSIONS,
  symptomForm as copy,
} from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";
import {
  useCreateSymptom,
  useDeleteSymptom,
  useSymptoms,
  useUpdateSymptom,
} from "../hooks/use-symptoms";
import type { SymptomFormProps } from "../navigation/types";

type DimKey = (typeof SYMPTOM_DIMENSIONS)[number]["key"];
const NEUTRAL: Record<DimKey, number> = {
  mood: 5,
  focus: 5,
  sleep: 5,
  agitation: 5,
  impulse: 5,
};

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function scoreColor(value: number, highIsBad: boolean, c: Palette): string {
  const bad = highIsBad ? value >= 7 : value <= 3;
  const good = highIsBad ? value <= 3 : value >= 7;
  if (bad) return c.danger;
  if (good) return c.success;
  return c.brand;
}

// Full graded observation form (parity with the PWA SymptomForm): a 0–10 scale
// per dimension, date (today/yesterday), routines-followed toggle and free
// notes. Tap-to-set cells instead of a draggable slider — more reliable and
// lower friction on touch for the ADHD audience.
export function SymptomFormScreen({ navigation, route }: SymptomFormProps) {
  const { childId, childName, symptomId } = route.params;
  const editing = !!symptomId;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const symptomsQuery = useSymptoms(childId);
  const existing = symptomId
    ? symptomsQuery.data?.find((s) => s.id === symptomId)
    : null;

  const create = useCreateSymptom();
  const update = useUpdateSymptom();
  const remove = useDeleteSymptom();

  const [ready, setReady] = useState(!editing);
  const [date, setDate] = useState(todayISO());
  const [values, setValues] = useState<Record<DimKey, number>>(NEUTRAL);
  const [routinesOk, setRoutinesOk] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);

  // Populate from the existing entry once (edit mode).
  useEffect(() => {
    if (ready || !existing) return;
    setDate(existing.date);
    setValues({
      mood: existing.mood,
      focus: existing.focus,
      sleep: existing.sleep,
      agitation: existing.agitation,
      impulse: existing.impulse,
    });
    setRoutinesOk(existing.routinesOk ?? true);
    setNotes(existing.notes ?? "");
    setReady(true);
  }, [existing, ready]);

  const saving = create.isPending || update.isPending;

  function save() {
    setError(false);
    const payload = {
      date,
      ...values,
      routinesOk,
      notes: notes.trim() || undefined,
    };
    const onDone = {
      onSuccess: () => {
        Alert.alert(copy.saved);
        navigation.goBack();
      },
      onError: () => setError(true),
    };
    if (editing && symptomId) {
      update.mutate({ id: symptomId, childId, ...payload }, onDone);
    } else {
      create.mutate({ childId, ...payload }, onDone);
    }
  }

  function onDelete() {
    if (!symptomId) return;
    confirmDelete(() =>
      remove.mutate(
        { id: symptomId, childId },
        { onSuccess: () => navigation.goBack() },
      ),
    );
  }

  if (editing && (symptomsQuery.isLoading || (!existing && !ready))) {
    return (
      <Screen scroll>
        <ScreenHeader
          title={copy.editTitle}
          subtitle={childName}
          onBack={() => navigation.goBack()}
        />
        {symptomsQuery.isLoading ? <Loader /> : <ErrorNote message={copy.notFound} />}
      </Screen>
    );
  }

  const isToday = date === todayISO();
  const isYesterday = date === yesterdayISO();

  return (
    <Screen scroll>
      <ScreenHeader
        title={editing ? copy.editTitle : copy.newTitle}
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* Date */}
      <Card>
        <SectionLabel>{copy.date}</SectionLabel>
        <View style={styles.pills}>
          <Pressable
            onPress={() => setDate(todayISO())}
            style={[styles.pill, isToday && styles.pillOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: isToday }}
          >
            <Text style={[styles.pillText, isToday && styles.pillTextOn]}>
              {copy.today}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDate(yesterdayISO())}
            style={[styles.pill, isYesterday && styles.pillOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: isYesterday }}
          >
            <Text style={[styles.pillText, isYesterday && styles.pillTextOn]}>
              {copy.yesterday}
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Dimensions */}
      <Card>
        {SYMPTOM_DIMENSIONS.map((dim) => {
          const value = values[dim.key];
          const color = scoreColor(value, dim.highIsBad, c);
          return (
            <View key={dim.key} style={styles.dim}>
              <View style={styles.dimHead}>
                <Text style={styles.dimLabel}>{dim.label}</Text>
                <Text style={[styles.dimValue, { color }]}>{value}</Text>
              </View>
              <View style={styles.scale}>
                {Array.from({ length: 11 }, (_, n) => {
                  const on = n <= value;
                  return (
                    <Pressable
                      key={n}
                      onPress={() =>
                        setValues((prev) => ({ ...prev, [dim.key]: n }))
                      }
                      style={[
                        styles.cell,
                        { backgroundColor: on ? color : c.secondary },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${dim.label} ${n}`}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </Card>

      {/* Routines followed */}
      <Card>
        <SectionLabel>{copy.routines}</SectionLabel>
        <View style={styles.pills}>
          <Pressable
            onPress={() => setRoutinesOk(true)}
            style={[styles.pill, routinesOk && styles.pillOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: routinesOk }}
          >
            <Text style={[styles.pillText, routinesOk && styles.pillTextOn]}>
              {copy.routinesYes}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setRoutinesOk(false)}
            style={[styles.pill, !routinesOk && styles.pillOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: !routinesOk }}
          >
            <Text style={[styles.pillText, !routinesOk && styles.pillTextOn]}>
              {copy.routinesNo}
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Notes */}
      <Card>
        <SectionLabel>{copy.notes}</SectionLabel>
        <TextInput
          style={styles.input}
          placeholder={copy.notesPlaceholder}
          placeholderTextColor={c.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Card>

      {error ? <ErrorNote message={copy.error} /> : null}

      <Button
        label={saving ? copy.saving : copy.save}
        onPress={save}
        loading={saving}
      />

      {editing ? (
        <Pressable
          onPress={onDelete}
          style={styles.deleteRow}
          accessibilityRole="button"
          accessibilityLabel={copy.deleteObs}
          disabled={remove.isPending}
        >
          <Text style={styles.deleteText}>{copy.deleteObs}</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    pills: { flexDirection: "row", gap: 8 },
    pill: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
    },
    pillOn: { backgroundColor: c.brand, borderColor: c.brand },
    pillText: { color: c.subtext, fontFamily: fonts.medium, fontSize: 14 },
    pillTextOn: { color: "#fff", fontFamily: fonts.semibold },
    dim: { gap: 8, paddingVertical: 6 },
    dimHead: { flexDirection: "row", justifyContent: "space-between" },
    dimLabel: { fontSize: 15, color: c.text, fontFamily: fonts.medium },
    dimValue: { fontSize: 16, fontFamily: fonts.bold, fontVariant: ["tabular-nums"] },
    scale: { flexDirection: "row", gap: 4 },
    cell: { flex: 1, height: 28, borderRadius: 6 },
    input: {
      minHeight: 80,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      textAlignVertical: "top",
      color: c.text,
      backgroundColor: c.bg,
      fontFamily: fonts.body,
    },
    deleteRow: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      marginTop: 2,
    },
    deleteText: { color: c.danger, fontFamily: fonts.semibold, fontSize: 15 },
  });
