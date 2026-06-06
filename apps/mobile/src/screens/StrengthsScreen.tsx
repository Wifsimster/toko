import type { StrengthCategory } from "@focusflow/validators";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import {
  useCreateStrength,
  useDeleteStrength,
  useStrengths,
} from "../hooks/use-strengths";
import type { StrengthsProps } from "../navigation/types";

const CATEGORIES: { value: StrengthCategory; label: string; emoji: string }[] =
  [
    { value: "talent", label: "Talent", emoji: "🌟" },
    { value: "achievement", label: "Réussite", emoji: "🏆" },
    { value: "quality", label: "Qualité", emoji: "💎" },
    { value: "progress", label: "Progrès", emoji: "📈" },
  ];

const categoryEmoji = (c: StrengthCategory) =>
  CATEGORIES.find((x) => x.value === c)?.emoji ?? "✨";
const categoryLabel = (c: StrengthCategory) =>
  CATEGORIES.find((x) => x.value === c)?.label ?? c;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function StrengthsScreen({ navigation, route }: StrengthsProps) {
  const { childId, childName } = route.params;
  const list = useStrengths(childId);
  const create = useCreateStrength(childId);
  const remove = useDeleteStrength(childId);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState<StrengthCategory>("talent");

  function submit() {
    if (!title.trim()) return;
    create.mutate(
      {
        childId,
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        emoji: emoji.trim() || undefined,
        occurredOn: todayISO(),
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setEmoji("");
          setCategory("talent");
          setAdding(false);
        },
      },
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Forces"
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
            placeholder="Ce qu'il ou elle fait bien"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Détails (optionnel)"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={styles.input}
            placeholder="Emoji (optionnel — ex. 🎨)"
            placeholderTextColor={colors.muted}
            value={emoji}
            onChangeText={setEmoji}
          />
          <View style={styles.pills}>
            {CATEGORIES.map((c) => {
              const on = c.value === category;
              return (
                <Pressable
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  style={[styles.pill, on && styles.pillOn]}
                >
                  <Text style={[styles.pillText, on && styles.pillTextOn]}>
                    {c.emoji} {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {create.isError ? (
            <ErrorNote message="Impossible d'ajouter cette force." />
          ) : null}
          <PrimaryButton
            label="Ajouter"
            onPress={submit}
            loading={create.isPending}
            disabled={!title.trim()}
          />
        </Card>
      ) : null}

      {list.isLoading ? (
        <Loader />
      ) : list.data && list.data.length > 0 ? (
        list.data.map((s) => (
          <Card key={s.id}>
            <View style={styles.cardHead}>
              <Text style={styles.cardEmoji}>
                {s.emoji ?? categoryEmoji(s.category)}
              </Text>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{s.title}</Text>
                <Text style={styles.meta}>
                  {categoryLabel(s.category)}
                </Text>
              </View>
            </View>
            {s.description ? (
              <Text style={styles.description}>{s.description}</Text>
            ) : null}
            <Pressable onPress={() => remove.mutate(s.id)} hitSlop={8}>
              <Text style={styles.delete}>Supprimer</Text>
            </Pressable>
          </Card>
        ))
      ) : (
        <EmptyState
          title="Aucune force notée"
          body="Notez ce que votre enfant réussit, même les petites choses. Ça booste la motivation de tout le monde."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { color: colors.action, fontSize: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#fff",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  pillText: { color: colors.subtext },
  pillTextOn: { color: "#fff", fontWeight: "600" },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardEmoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  name: { fontSize: 17, fontWeight: "600", color: colors.text },
  meta: { color: colors.subtext, fontSize: 13 },
  description: { color: colors.subtext, fontSize: 14, lineHeight: 20 },
  delete: { color: colors.danger, marginTop: 4 },
});
