import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { Card, SectionLabel, fonts } from "./ui";
import { home as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";
import { useMedicationAdherence, useLogMedication } from "../hooks/use-medications";
import { useSymptoms } from "../hooks/use-symptoms";
import { useJournal } from "../hooks/use-journal";

// 1-tap medication log for today, mirroring the PWA MedicationQuickLog. Only
// renders when the child has at least one treatment.
export function MedicationQuickLog({ childId }: { childId: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { data } = useMedicationAdherence(childId);
  const log = useLogMedication(childId);
  const today = todayISO();

  const meds = data?.medications ?? [];
  if (meds.length === 0) return null;

  function set(medicationId: string, taken: boolean) {
    log.mutate({ medicationId, date: today, taken });
  }

  return (
    <View style={s.block}>
      <SectionLabel>{copy.medsTitle}</SectionLabel>
      {meds.map((m) => (
        <Card key={m.id} style={s.row}>
          <View style={s.info}>
            <Text style={s.name}>{m.name}</Text>
            {m.adherenceRate != null ? (
              <Text style={s.meta}>{copy.adherence(m.adherenceRate)}</Text>
            ) : null}
          </View>
          <View style={s.actions}>
            <Pressable
              onPress={() => set(m.id, true)}
              style={[s.btn, m.todayTaken === true && s.btnTaken]}
              accessibilityRole="button"
              accessibilityLabel={`${m.name} ${copy.taken}`}
            >
              <Text style={[s.btnText, m.todayTaken === true && s.btnTextOn]}>
                {copy.taken}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => set(m.id, false)}
              style={[s.btn, m.todayTaken === false && s.btnMissed]}
              accessibilityRole="button"
              accessibilityLabel={`${m.name} ${copy.missed}`}
            >
              <Text style={[s.btnText, m.todayTaken === false && s.btnTextOn]}>
                {copy.missed}
              </Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </View>
  );
}

// Live "done today" checklist, mirroring the PWA DailyChecklist: evening logged,
// journal written, medications all taken (the meds line only if any exist).
export function DailyChecklist({ childId }: { childId: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const today = todayISO();

  const symptoms = useSymptoms(childId);
  const journal = useJournal(childId);
  const adherence = useMedicationAdherence(childId);

  const eveningDone = (symptoms.data ?? []).some((e) => e.date === today);
  const journalDone = (journal.data ?? []).some((e) => e.date === today);
  const meds = adherence.data?.medications ?? [];
  const hasMeds = meds.length > 0;
  const medsDone = hasMeds && meds.every((m) => m.todayTaken === true);

  const items = [
    { key: "evening", label: copy.checkEvening, done: eveningDone },
    { key: "journal", label: copy.checkJournal, done: journalDone },
    ...(hasMeds ? [{ key: "meds", label: copy.checkMeds, done: medsDone }] : []),
  ];
  const allDone = items.every((i) => i.done);

  return (
    <Card style={s.checklist}>
      <Text style={s.checklistTitle}>{copy.checklistTitle}</Text>
      {items.map((i) => (
        <View key={i.key} style={s.checkRow}>
          <View style={[s.tick, i.done && s.tickOn]}>
            {i.done ? <Check size={14} color="#fff" /> : null}
          </View>
          <Text style={[s.checkLabel, i.done && s.checkLabelDone]}>{i.label}</Text>
        </View>
      ))}
      {allDone ? <Text style={s.allDone}>{copy.checklistDone}</Text> : null}
    </Card>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    block: { gap: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    info: { flex: 1 },
    name: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    meta: { fontSize: 12, color: c.muted, fontFamily: fonts.body, marginTop: 2 },
    actions: { flexDirection: "row", gap: 8 },
    btn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      minWidth: 64,
      alignItems: "center",
    },
    btnTaken: { backgroundColor: c.success, borderColor: c.success },
    btnMissed: { backgroundColor: c.danger, borderColor: c.danger },
    btnText: { fontSize: 13, color: c.subtext, fontFamily: fonts.semibold },
    btnTextOn: { color: "#fff" },
    checklist: { gap: 10 },
    checklistTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    tick: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    tickOn: { backgroundColor: c.success, borderColor: c.success },
    checkLabel: { fontSize: 15, color: c.text, fontFamily: fonts.body },
    checkLabelDone: { color: c.muted },
    allDone: { fontSize: 13, color: c.success, fontFamily: fonts.medium },
  });
