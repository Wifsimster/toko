import { useMemo, useState } from "react";
import type { JournalEntry, JournalTag } from "@focusflow/validators";
import { journalTagSchema } from "@focusflow/validators";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Pencil, Plus, Trash2 } from "lucide-react-native";

import { journal as copy, journalTagLabels } from "../lib/copy";
import { formatFrDate, todayISO } from "../lib/date";

/** Friendly relative date: "Aujourd'hui" / "Hier" / full French date. */
function relativeDate(iso: string): string {
  const today = new Date();
  const d = new Date(iso + "T00:00:00");
  const days = Math.round(
    (new Date(today.toISOString().slice(0, 10) + "T00:00:00").getTime() -
      d.getTime()) /
      86400000,
  );
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return formatFrDate(iso);
}
import {
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useJournal,
  useUpdateJournalEntry,
} from "../hooks/use-journal";
import { useActiveChild } from "../lib/active-child";
import {
  Button,
  Card,
  EmptyState,
  FAB,
  FilterChips,
  Loader,
  Screen,
  ScreenHeader,
  confirmDelete,
  fonts,
} from "../components/ui";
import { HistoryLimitNotice } from "../components/history-limit-notice";
import { useTheme, type Palette } from "../lib/theme";
import type { JournalProps } from "../navigation/types";

const ALL_TAGS = journalTagSchema.options;
const TAG_FILTERS = [
  { key: "all", label: "Toutes" },
  ...ALL_TAGS.map((t) => ({ key: t, label: journalTagLabels[t] ?? t })),
];

export function JournalScreen({ route }: JournalProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";
  const { data: entries, isLoading } = useJournal(childId);
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [filterTag, setFilterTag] = useState<string>("all");
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<JournalTag[]>([]);

  const isEditing = !!editing;
  const pending = createEntry.isPending || updateEntry.isPending;

  const visible = (entries ?? []).filter(
    (e) => filterTag === "all" || e.tags.includes(filterTag as JournalTag),
  );

  function toggleTag(tag: JournalTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function closeComposer() {
    setText("");
    setTags([]);
    setEditing(null);
    setComposing(false);
  }

  function startEdit(entry: JournalEntry) {
    setEditing(entry);
    setText(entry.text);
    setTags(entry.tags);
    setComposing(true);
  }

  function submit() {
    if (isEditing && editing) {
      updateEntry.mutate(
        { id: editing.id, childId, text: text.trim(), tags },
        { onSuccess: closeComposer },
      );
    } else {
      createEntry.mutate(
        { childId, date: todayISO(), text: text.trim(), tags },
        { onSuccess: closeComposer },
      );
    }
  }

  return (
    <Screen
      scroll
      fab={
        !composing ? (
          <FAB
            icon={<Plus size={26} color="#fff" />}
            label="Écrire une entrée"
            onPress={() => setComposing(true)}
          />
        ) : undefined
      }
    >
      <ScreenHeader title={copy.title} subtitle={childName} />

      {composing ? (
        <Card>
          <Text style={styles.formTitle}>
            {isEditing ? "Modifier l'entrée" : copy.title}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={copy.notesPlaceholder}
            placeholderTextColor={c.muted}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />
          <View style={styles.tagRow}>
            {ALL_TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={[styles.tag, on && styles.tagOn]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, on && styles.tagTextOn]}>
                    {journalTagLabels[tag] ?? tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.composerActions}>
            <Pressable onPress={closeComposer} style={styles.cancelHit}>
              <Text style={styles.cancel}>{copy.cancel}</Text>
            </Pressable>
            <Button
              label={
                pending
                  ? copy.saving
                  : isEditing
                    ? "Enregistrer"
                    : copy.addEntry
              }
              onPress={submit}
              loading={pending}
              disabled={!text.trim()}
              size="sm"
            />
          </View>
        </Card>
      ) : null}

      {!composing && (entries?.length ?? 0) > 0 ? (
        <FilterChips options={TAG_FILTERS} value={filterTag} onChange={setFilterTag} />
      ) : null}

      {isLoading ? (
        <Loader />
      ) : visible.length === 0 ? (
        composing ? null : (
          <EmptyState
            title={copy.empty}
            body="Notez une victoire, une difficulté, une stratégie qui a aidé."
          />
        )
      ) : (
        visible.map((item) => (
          <Card key={item.id}>
            <View style={styles.cardHead}>
              <Text style={styles.cardDate}>{relativeDate(item.date)}</Text>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => startEdit(item)}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Modifier l'entrée"
                  hitSlop={8}
                >
                  <Pencil size={18} color={c.muted} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    confirmDelete(() =>
                      deleteEntry.mutate({ id: item.id, childId }),
                    )
                  }
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Supprimer l'entrée"
                  hitSlop={8}
                >
                  <Trash2 size={18} color={c.muted} />
                </Pressable>
              </View>
            </View>
            {item.text ? <Text style={styles.cardText}>{item.text}</Text> : null}
            {item.tags.length > 0 ? (
              <View style={styles.tagRow}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.cardTag}>
                    <Text style={styles.cardTagText}>
                      {journalTagLabels[tag] ?? tag}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ))
      )}

      {!composing && (entries?.length ?? 0) > 0 ? <HistoryLimitNotice /> : null}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    input: {
      minHeight: 90,
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
    formTitle: { fontSize: 16, fontFamily: fonts.semibold, color: c.text },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagOn: { backgroundColor: c.brand, borderColor: c.brand },
    tagText: { fontSize: 13, color: c.subtext, fontFamily: fonts.medium },
    tagTextOn: { color: "#fff", fontFamily: fonts.semibold },
    composerActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 16,
    },
    cancelHit: { minHeight: 40, justifyContent: "center" },
    cancel: { color: c.muted, fontFamily: fonts.medium },
    cardHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardDate: {
      fontSize: 14,
      color: c.muted,
      textTransform: "capitalize",
      fontFamily: fonts.semibold,
    },
    cardActions: { flexDirection: "row", alignItems: "center", marginTop: -10 },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    cardText: { fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    cardTag: {
      backgroundColor: c.secondary,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    cardTagText: { fontSize: 12, color: c.subtext, fontFamily: fonts.medium },
  });
