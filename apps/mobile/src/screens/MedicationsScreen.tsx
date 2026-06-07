import type { Medication, MedicationSchedule } from "@focusflow/validators";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  confirmDelete,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useCreateMedication,
  useDeleteMedication,
  useMedications,
  useUpdateMedication,
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
  const update = useUpdateMedication(childId);
  const remove = useDeleteMedication(childId);

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [editing, setEditing] = useState<Medication | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [schedule, setSchedule] = useState<MedicationSchedule>("morning");
  const [active, setActive] = useState(true);

  const isEditing = !!editing;
  const pending = create.isPending || update.isPending;

  function reset() {
    setEditing(null);
    setName("");
    setDose("");
    setNotes("");
    setSchedule("morning");
    setActive(true);
    setOpen(false);
  }

  function startCreate() {
    if (open && !isEditing) {
      reset();
    } else {
      setEditing(null);
      setName("");
      setDose("");
      setNotes("");
      setSchedule("morning");
      setActive(true);
      setOpen(true);
    }
  }

  function startEdit(m: Medication) {
    setEditing(m);
    setName(m.name);
    setDose(m.dose ?? "");
    setNotes(m.notes ?? "");
    setSchedule(m.schedule);
    setActive(m.active);
    setOpen(true);
  }

  function submit() {
    if (!name.trim()) return;
    if (isEditing && editing) {
      update.mutate(
        {
          id: editing.id,
          name: name.trim(),
          dose: dose.trim() || undefined,
          notes: notes.trim() || undefined,
          schedule,
          active,
        },
        { onSuccess: reset },
      );
    } else {
      create.mutate(
        {
          childId,
          name: name.trim(),
          dose: dose.trim() || undefined,
          notes: notes.trim() || undefined,
          schedule,
          startDate: todayISO(),
          active: true,
        },
        { onSuccess: reset },
      );
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Médicaments"
        subtitle={childName}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={startCreate} hitSlop={10}>
            <Text style={styles.add}>
              {open && !isEditing ? "Fermer" : "+ Ajouter"}
            </Text>
          </Pressable>
        }
      />

      {open ? (
        <Card>
          <Text style={styles.formTitle}>
            {isEditing ? "Modifier le traitement" : "Nouveau traitement"}
          </Text>
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
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Notes (effets, consignes…) — optionnel"
            placeholderTextColor={c.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          {isEditing ? (
            <View style={styles.activeRow}>
              <Text style={styles.activeLabel}>Traitement en cours</Text>
              <View style={styles.toggle}>
                <Pressable
                  onPress={() => setActive(true)}
                  style={[styles.toggleBtn, active && styles.toggleOn]}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextOn]}>
                    En cours
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActive(false)}
                  style={[styles.toggleBtn, !active && styles.toggleOnDanger]}
                >
                  <Text style={[styles.toggleText, !active && styles.toggleTextOn]}>
                    Arrêté
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          {create.isError || update.isError ? (
            <ErrorNote message="Impossible d'enregistrer le traitement." />
          ) : null}
          <PrimaryButton
            label={isEditing ? "Enregistrer" : "Ajouter le traitement"}
            onPress={submit}
            loading={pending}
            disabled={!name.trim()}
          />
          {isEditing ? (
            <Pressable onPress={reset} style={styles.cancelRow}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
          ) : null}
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
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => startEdit(m)}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Modifier le traitement"
                  hitSlop={6}
                >
                  <Pencil size={17} color={c.muted} />
                </Pressable>
                <Pressable
                  onPress={() => confirmDelete(() => remove.mutate(m.id))}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Supprimer le traitement"
                  hitSlop={6}
                >
                  <Trash2 size={17} color={c.muted} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.meta}>
              {scheduleLabel(m.schedule)}
              {m.dose ? ` · ${m.dose}` : ""}
            </Text>
            {m.notes ? <Text style={styles.notes}>{m.notes}</Text> : null}
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
    add: { color: c.action, fontSize: 16, fontFamily: fonts.semibold },
    formTitle: { fontSize: 16, fontFamily: fonts.semibold, color: c.text },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.bg,
      fontFamily: fonts.body,
    },
    multiline: { minHeight: 64, textAlignVertical: "top" },
    pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillOn: { backgroundColor: c.brand, borderColor: c.brand },
    pillText: { color: c.subtext, fontFamily: fonts.medium },
    pillTextOn: { color: "#fff", fontFamily: fonts.semibold },
    activeRow: { gap: 8 },
    activeLabel: { fontSize: 14, color: c.subtext, fontFamily: fonts.medium },
    toggle: { flexDirection: "row", gap: 8 },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
    },
    toggleOn: { backgroundColor: c.brand, borderColor: c.brand },
    toggleOnDanger: { backgroundColor: c.danger, borderColor: c.danger },
    toggleText: { color: c.subtext, fontFamily: fonts.medium },
    toggleTextOn: { color: "#fff", fontFamily: fonts.semibold },
    cancelRow: { alignItems: "center", paddingVertical: 8 },
    cancelText: { color: c.muted, fontFamily: fonts.medium },
    cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    cardHeadLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    cardActions: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: -6, marginRight: -8 },
    iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    name: { fontSize: 17, fontFamily: fonts.semibold, color: c.text },
    inactive: { color: c.muted, fontSize: 13, fontFamily: fonts.medium },
    meta: { color: c.subtext, fontFamily: fonts.body },
    notes: { color: c.muted, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  });
