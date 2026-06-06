import { useMemo, useState } from "react";
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
import { confirmDelete, fonts } from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
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
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

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
            placeholderTextColor={c.muted}
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
        <ActivityIndicator color={c.action} />
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
                  onPress={() =>
                    confirmDelete(() => deleteItem.mutate({ id: item.id, childId }))
                  }
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg, padding: 24, gap: 12 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerSide: { flexShrink: 1 },
    back: { color: c.brand, fontSize: 16, fontFamily: fonts.medium },
    link: { color: c.brand, fontSize: 16, fontFamily: fonts.semibold },
    title: { fontSize: 26, color: c.text, fontFamily: fonts.heading },
    subtitle: { fontSize: 14, color: c.muted, fontFamily: fonts.body },
    crisisButton: {
      backgroundColor: c.alertSurface,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    crisisButtonText: { color: c.danger, fontSize: 16, fontFamily: fonts.bold },
    composer: {
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 16,
      backgroundColor: c.card,
    },
    emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    emojiChip: {
      width: 44,
      height: 44,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    emojiChipOn: { borderColor: c.brand, backgroundColor: c.successSurface },
    emojiChipText: { fontSize: 22 },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.bg,
    },
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
    disabled: { opacity: 0.4 },
    scroll: { gap: 12, paddingBottom: 24 },
    emptyBox: { gap: 6, paddingVertical: 12 },
    emptyTitle: { fontSize: 17, fontFamily: fonts.semibold, color: c.text },
    muted: { color: c.muted, fontFamily: fonts.body },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 16,
      backgroundColor: c.card,
    },
    cardEmoji: { fontSize: 24 },
    cardLabel: { flex: 1, fontSize: 16, color: c.text, fontFamily: fonts.body },
    deleteLink: { color: c.danger, fontSize: 13 },
    support: {
      marginTop: 12,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 16,
    },
    supportTitle: { fontSize: 15, fontFamily: fonts.semibold, color: c.subtext },
    supportLink: { color: c.brand, fontSize: 15, paddingVertical: 4 },
    // Crisis mode — calm full screen using successSurface token
    crisisContainer: { flex: 1, backgroundColor: c.successSurface, padding: 24 },
    crisisClose: { alignSelf: "flex-end", minHeight: 44, justifyContent: "center" },
    crisisCloseText: { color: c.successFg, fontSize: 16, fontFamily: fonts.medium },
    crisisCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
    crisisEmoji: { fontSize: 96 },
    crisisLabel: {
      fontSize: 28,
      color: c.successFg,
      textAlign: "center",
      fontFamily: fonts.heading,
    },
    crisisCounter: { fontSize: 16, color: c.successFg, fontFamily: fonts.medium },
    crisisNav: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    navButton: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    navButtonText: { color: c.brand, fontSize: 16, fontFamily: fonts.semibold },
  });
