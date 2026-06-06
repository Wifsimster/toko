import type { MedicationSchedule } from "@focusflow/validators";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Trash2 } from "lucide-react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  confirmDelete,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useCreateMedication,
  useDeleteMedication,
  useMedications,
} from "../hooks/use-medications";
import type { MedicationsProps } from "../navigation/types";

const SCHEDULES: { value: MedicationSchedule; label: string }[] = [
  { value: "morning", label: "Matin" },
  { value: "noon", label: "Midi" },
  { value: "evening", label: "Soir" },
  { value: "bedtime", label: "Coucher" },
  { value: "custom", label: "Autre" },
];

const scheduleLabel = (s: MedicationSchedule) =>
  SCHEDULES.find((x) => x.value === s)?.label ?? s;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function MedicationsScreen({ navigation, route }: MedicationsProps) {
  const { childId, childName } = route.params;
  const list = useMedications(childId);
  const create = useCreateMedication(childId);
  const remove = useDeleteMedication(childId);

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [schedule, setSchedule] = useState<MedicationSchedule>("morning");

  function submit() {
    if (!name.trim()) return;
    create.mutate(
      {
        childId,
        name: name.trim(),
        dose: dose.trim() || undefined,
        schedule,
        startDate: todayISO(),
        active: true,
      },
      {
        onSuccess: () => {
          setName("");
          setDose("");
          setSchedule("morning");
          setAdding(false);
        },
      },
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Médicaments"
        subtitle={childName}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={() => setAdding((v) => !v)} hitSlop={10}>
            <Text style={styles.add}>{adding ? "Fermer" : "+ Ajouter"}</Text>
          </Pressable>
        }
      />

      {adding ? (
        <Card>
          <TextInput
            style={styles.input}
            placeholder="Nom du traitement"
            placeholderTextColor={c.muted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Dose (ex. 10 mg) — optionnel"
            placeholderTextColor={c.muted}
            value={dose}
            onChangeText={setDose}
          />
          <View style={styles.pills}>
            {SCHEDULES.map((s) => {
              const on = s.value === schedule;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => setSchedule(s.value)}
                  style={[styles.pill, on && styles.pillOn]}
                >
                  <Text style={[styles.pillText, on && styles.pillTextOn]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {create.isError ? (
            <ErrorNote message="Impossible d'ajouter le traitement." />
          ) : null}
          <PrimaryButton
            label="Ajouter le traitement"
            onPress={submit}
            loading={create.isPending}
            disabled={!name.trim()}
          />
        </Card>
      ) : null}

      {list.isLoading ? (
        <Loader />
      ) : list.data && list.data.length > 0 ? (
        list.data.map((m) => (
          <Card key={m.id}>
            <View style={styles.cardHead}>
              <View style={styles.cardHeadLeft}>
                <Text style={styles.name}>{m.name}</Text>
                {!m.active ? <Text style={styles.inactive}>Arrêté</Text> : null}
              </View>
              <Pressable
                onPress={() => confirmDelete(() => remove.mutate(m.id))}
                style={styles.iconBtn}
                accessibilityRole="button"
                accessibilityLabel="Supprimer le traitement"
                hitSlop={8}
              >
                <Trash2 size={18} color={c.muted} />
              </Pressable>
            </View>
            <Text style={styles.meta}>
              {scheduleLabel(m.schedule)}
              {m.dose ? ` · ${m.dose}` : ""}
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          title="Aucun traitement"
          body="Ajoutez les traitements en cours pour suivre la prise et les effets."
        />
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    add: { color: c.action, fontSize: 16, fontWeight: "600" },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.card,
    },
    pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillOn: { backgroundColor: c.brand, borderColor: c.brand },
    pillText: { color: c.subtext },
    pillTextOn: { color: "#fff", fontWeight: "600" },
    cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    cardHeadLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -10, marginTop: -10 },
    name: { fontSize: 17, fontWeight: "600", color: c.text },
    inactive: { color: c.muted, fontSize: 13 },
    meta: { color: c.subtext },
    delete: { color: c.danger, marginTop: 4 },
  });
