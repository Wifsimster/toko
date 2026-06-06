import { useMemo, useState } from "react";
import type { JournalTag } from "@focusflow/validators";
import { journalTagSchema } from "@focusflow/validators";
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
import { Plus } from "lucide-react-native";

import { useActiveChild } from "../lib/active-child";
import { FAB, FilterChips, confirmDelete } from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
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
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
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
      </View>

      <Text style={styles.title}>{copy.title}</Text>

      {composing ? (
        <View style={styles.composer}>
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
        <ActivityIndicator color={c.action} />
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

      {!composing ? (
        <FAB
          icon={<Plus size={26} color="#fff" />}
          label="Écrire une entrée"
          onPress={() => setComposing(true)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg, padding: 24, gap: 14 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerSide: { flexShrink: 1 },
    back: { color: c.brand, fontSize: 16 },
    link: { color: c.brand, fontSize: 16, fontWeight: "500" },
    title: { fontSize: 24, fontWeight: "600", color: c.text },
    composer: {
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 16,
      backgroundColor: c.card,
    },
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
    },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagOn: { backgroundColor: c.brand, borderColor: c.brand },
    tagText: { fontSize: 13, color: c.subtext },
    tagTextOn: { color: "#fff" },
    composerActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 16,
    },
    cancel: { color: c.muted },
    button: {
      backgroundColor: c.brand,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    disabled: { opacity: 0.5 },
    listContent: { gap: 12, paddingBottom: 24 },
    muted: { color: c.muted },
    card: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 16,
      gap: 8,
      backgroundColor: c.card,
    },
    cardDate: { fontSize: 13, color: c.muted, textTransform: "capitalize" },
    cardText: { fontSize: 15, color: c.text },
    cardTag: {
      backgroundColor: c.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    cardTagText: { fontSize: 12, color: c.subtext },
    deleteLink: { color: c.danger, fontSize: 13 },
  });
