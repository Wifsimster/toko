import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CRISIS_EMOJIS, crisis as copy } from "../lib/copy";
import {
  useCreateCrisisItem,
  useCrisisItems,
  useDeleteCrisisItem,
} from "../hooks/use-crisis-list";
import type { CrisisListProps } from "../navigation/types";

const SUPPORT_LINKS = [
  { label: copy.support3114, url: "tel:3114" },
  { label: copy.supportAllo, url: "tel:0800235236" },
  { label: copy.supportHyper, url: "https://www.tdah-france.fr/" },
];

export function CrisisListScreen({ navigation, route }: CrisisListProps) {
  const { childId, childName } = route.params;
  const { data: items, isLoading } = useCrisisItems(childId);
  const createItem = useCreateCrisisItem();
  const deleteItem = useDeleteCrisisItem();

  const [composing, setComposing] = useState(false);
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState(CRISIS_EMOJIS[0]);
  const [crisisMode, setCrisisMode] = useState(false);
  const [index, setIndex] = useState(0);

  const list = items ?? [];

  function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;
    createItem.mutate(
      { childId, label: trimmed, emoji },
      {
        onSuccess: () => {
          setLabel("");
          setEmoji(CRISIS_EMOJIS[0]);
          setComposing(false);
        },
      },
    );
  }

  // Full-screen calm carousel for an active meltdown.
  if (crisisMode && list.length > 0) {
    const item = list[Math.min(index, list.length - 1)];
    return (
      <SafeAreaView style={styles.crisisContainer} edges={["top", "bottom"]}>
        <Pressable
          style={styles.crisisClose}
          onPress={() => setCrisisMode(false)}
          hitSlop={12}
        >
          <Text style={styles.crisisCloseText}>✕ {copy.close}</Text>
        </Pressable>
        <View style={styles.crisisCenter}>
          <Text style={styles.crisisEmoji}>{item?.emoji ?? "💙"}</Text>
          <Text style={styles.crisisLabel}>{item?.label}</Text>
          <Text style={styles.crisisCounter}>
            {Math.min(index, list.length - 1) + 1} / {list.length}
          </Text>
        </View>
        <View style={styles.crisisNav}>
          <Pressable
            style={[styles.navButton, index <= 0 && styles.disabled]}
            disabled={index <= 0}
            onPress={() => setIndex((i) => Math.max(i - 1, 0))}
          >
            <Text style={styles.navButtonText}>‹ {copy.prev}</Text>
          </Pressable>
          <Pressable
            style={[styles.navButton, index >= list.length - 1 && styles.disabled]}
            disabled={index >= list.length - 1}
            onPress={() => setIndex((i) => Math.min(i + 1, list.length - 1))}
          >
            <Text style={styles.navButtonText}>{copy.next} ›</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerSide}>
          <Text style={styles.back}>‹ {childName}</Text>
        </Pressable>
        {!composing ? (
          <Pressable onPress={() => setComposing(true)} hitSlop={12}>
            <Text style={styles.link}>+ {copy.add}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.subtitle}>{copy.subtitle(childName)}</Text>

      {list.length > 0 ? (
        <Pressable
          style={styles.crisisButton}
          onPress={() => {
            setIndex(0);
            setCrisisMode(true);
          }}
        >
          <Text style={styles.crisisButtonText}>🆘 {copy.crisisMode}</Text>
        </Pressable>
      ) : null}

      {composing ? (
        <View style={styles.composer}>
          <View style={styles.emojiRow}>
            {CRISIS_EMOJIS.map((e) => (
              <Pressable
                key={e}
                style={[styles.emojiChip, emoji === e && styles.emojiChipOn]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiChipText}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder={copy.labelPlaceholder}
            value={label}
            onChangeText={setLabel}
            autoFocus
          />
          <View style={styles.composerActions}>
            <Pressable onPress={() => setComposing(false)}>
              <Text style={styles.cancel}>{copy.cancel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, createItem.isPending && styles.disabled]}
              disabled={createItem.isPending}
              onPress={submit}
            >
              <Text style={styles.buttonText}>{copy.addToList}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {list.length === 0 && !composing ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.muted}>{copy.emptyBody}</Text>
            </View>
          ) : (
            list.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardEmoji}>{item.emoji ?? "💙"}</Text>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Pressable
                  onPress={() => deleteItem.mutate({ id: item.id, childId })}
                  hitSlop={8}
                >
                  <Text style={styles.deleteLink}>{copy.delete}</Text>
                </Pressable>
              </View>
            ))
          )}

          <View style={styles.support}>
            <Text style={styles.supportTitle}>{copy.supportTitle}</Text>
            {SUPPORT_LINKS.map((s) => (
              <Pressable key={s.url} onPress={() => Linking.openURL(s.url)}>
                <Text style={styles.supportLink}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerSide: { flexShrink: 1 },
  back: { color: "#358891", fontSize: 16 },
  link: { color: "#358891", fontSize: 16, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "600" },
  subtitle: { fontSize: 14, color: "#6d6059" },
  crisisButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  crisisButtonText: { color: "#b91c1c", fontSize: 16, fontWeight: "700" },
  composer: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#e6e0d9",
    borderRadius: 12,
    padding: 16,
  },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8d0c7",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiChipOn: { borderColor: "#358891", backgroundColor: "#eef2ff" },
  emojiChipText: { fontSize: 22 },
  input: {
    borderWidth: 1,
    borderColor: "#d8d0c7",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
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
  disabled: { opacity: 0.4 },
  scroll: { gap: 12, paddingBottom: 24 },
  emptyBox: { gap: 6, paddingVertical: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "600" },
  muted: { color: "#6d6059" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#e6e0d9",
    borderRadius: 12,
    padding: 16,
  },
  cardEmoji: { fontSize: 24 },
  cardLabel: { flex: 1, fontSize: 16, color: "#2a1f17" },
  deleteLink: { color: "#cf4040", fontSize: 13 },
  support: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3efea",
    paddingTop: 16,
  },
  supportTitle: { fontSize: 15, fontWeight: "600", color: "#3a2c22" },
  supportLink: { color: "#358891", fontSize: 15, paddingVertical: 4 },
  // Crisis mode
  crisisContainer: { flex: 1, backgroundColor: "#eef2ff", padding: 24 },
  crisisClose: { alignSelf: "flex-end" },
  crisisCloseText: { color: "#358891", fontSize: 16 },
  crisisCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  crisisEmoji: { fontSize: 96 },
  crisisLabel: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1e1b4b",
    textAlign: "center",
  },
  crisisCounter: { fontSize: 16, color: "#6366f1" },
  crisisNav: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  navButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  navButtonText: { color: "#358891", fontSize: 16, fontWeight: "600" },
});
