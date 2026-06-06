import type { JournalTag } from "@focusflow/validators";
import { journalTagSchema } from "@focusflow/validators";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { journal as copy, journalTagLabels } from "../lib/copy";
import { formatFrDate, todayISO } from "../lib/date";
import {
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useJournal,
} from "../hooks/use-journal";
import { useActiveChild } from "../lib/active-child";
import { FilterChips, confirmDelete } from "../components/ui";
import type { JournalProps } from "../navigation/types";

const ALL_TAGS = journalTagSchema.options;
const TAG_FILTERS = [
  { key: "all", label: "Toutes" },
  ...ALL_TAGS.map((t) => ({ key: t, label: journalTagLabels[t] ?? t })),
];

export function JournalScreen({ navigation, route }: JournalProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";
  const { data: entries, isLoading } = useJournal(childId);
  const [filterTag, setFilterTag] = useState<string>("all");
  const visible = (entries ?? []).filter(
    (e) => filterTag === "all" || e.tags.includes(filterTag as JournalTag),
  );
  const createEntry = useCreateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<JournalTag[]>([]);

  function toggleTag(tag: JournalTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function submit() {
    createEntry.mutate(
      { childId, date: todayISO(), text: text.trim(), tags },
      {
        onSuccess: () => {
          setText("");
          setTags([]);
          setComposing(false);
        },
      },
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.back}>{childName}</Text>
        {!composing ? (
          <Pressable onPress={() => setComposing(true)} hitSlop={12}>
            <Text style={styles.link}>+ {copy.writeButton}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{copy.title}</Text>

      {composing ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder={copy.notesPlaceholder}
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
            <Pressable onPress={() => setComposing(false)}>
              <Text style={styles.cancel}>{copy.cancel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, createEntry.isPending && styles.disabled]}
              disabled={createEntry.isPending}
              onPress={submit}
            >
              <Text style={styles.buttonText}>
                {createEntry.isPending ? copy.saving : copy.addEntry}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!composing && (entries?.length ?? 0) > 0 ? (
        <FilterChips options={TAG_FILTERS} value={filterTag} onChange={setFilterTag} />
      ) : null}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            composing ? null : <Text style={styles.muted}>{copy.empty}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardDate}>{formatFrDate(item.date)}</Text>
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
              <Pressable
                onPress={() =>
                  confirmDelete(() => deleteEntry.mutate({ id: item.id, childId }))
                }
                hitSlop={8}
              >
                <Text style={styles.deleteLink}>{copy.delete}</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerSide: { flexShrink: 1 },
  back: { color: "#358891", fontSize: 16 },
  link: { color: "#358891", fontSize: 16, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "600" },
  composer: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#e6e0d9",
    borderRadius: 12,
    padding: 16,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#d8d0c7",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    textAlignVertical: "top",
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    borderWidth: 1,
    borderColor: "#d8d0c7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagOn: { backgroundColor: "#358891", borderColor: "#358891" },
  tagText: { fontSize: 13, color: "#3a2c22" },
  tagTextOn: { color: "#fff" },
  composerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  cancel: { color: "#6d6059" },
  button: {
    backgroundColor: "#358891",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.5 },
  listContent: { gap: 12, paddingBottom: 24 },
  muted: { color: "#6d6059" },
  card: {
    borderWidth: 1,
    borderColor: "#e6e0d9",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardDate: { fontSize: 13, color: "#6d6059", textTransform: "capitalize" },
  cardText: { fontSize: 15, color: "#2a1f17" },
  cardTag: {
    backgroundColor: "#f3efea",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardTagText: { fontSize: 12, color: "#52443b" },
  deleteLink: { color: "#cf4040", fontSize: 13 },
});
