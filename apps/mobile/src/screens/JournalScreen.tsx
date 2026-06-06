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
import type { JournalProps } from "../navigation/types";

const ALL_TAGS = journalTagSchema.options;

export function JournalScreen({ navigation, route }: JournalProps) {
  const { childId, childName } = route.params;
  const { data: entries, isLoading } = useJournal(childId);
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
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerSide}
        >
          <Text style={styles.back}>‹ {childName}</Text>
        </Pressable>
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

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={entries ?? []}
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
                onPress={() => deleteEntry.mutate({ id: item.id, childId })}
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
  back: { color: "#4f46e5", fontSize: 16 },
  link: { color: "#4f46e5", fontSize: 16, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "600" },
  composer: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 16,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    textAlignVertical: "top",
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagOn: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  tagText: { fontSize: 13, color: "#3f3f46" },
  tagTextOn: { color: "#fff" },
  composerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  cancel: { color: "#71717a" },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.5 },
  listContent: { gap: 12, paddingBottom: 24 },
  muted: { color: "#71717a" },
  card: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardDate: { fontSize: 13, color: "#71717a", textTransform: "capitalize" },
  cardText: { fontSize: 15, color: "#27272a" },
  cardTag: {
    backgroundColor: "#f4f4f5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardTagText: { fontSize: 12, color: "#52525b" },
  deleteLink: { color: "#dc2626", fontSize: 13 },
});
