import type { Strength, StrengthCategory } from "@focusflow/validators";
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
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useCreateStrength,
  useDeleteStrength,
  useStrengths,
  useUpdateStrength,
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
  const update = useUpdateStrength(childId);
  const remove = useDeleteStrength(childId);

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Strength | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState<StrengthCategory>("talent");

  const isEditing = !!editing;
  const pending = create.isPending || update.isPending;

  function reset() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setEmoji("");
    setCategory("talent");
    setAdding(false);
  }

  function startCreate() {
    if (adding && !isEditing) {
      reset();
    } else {
      setEditing(null);
      setTitle("");
      setDescription("");
      setEmoji("");
      setCategory("talent");
      setAdding(true);
    }
  }

  function startEdit(s: Strength) {
    setEditing(s);
    setTitle(s.title);
    setDescription(s.description ?? "");
    setEmoji(s.emoji ?? "");
    setCategory(s.category);
    setAdding(true);
  }

  function submit() {
    if (!title.trim()) return;
    if (isEditing && editing) {
      update.mutate(
        {
          id: editing.id,
          category,
          title: title.trim(),
          description: description.trim() || undefined,
          emoji: emoji.trim() || undefined,
        },
        { onSuccess: reset },
      );
    } else {
      create.mutate(
        {
          childId,
          category,
          title: title.trim(),
          description: description.trim() || undefined,
          emoji: emoji.trim() || undefined,
          occurredOn: todayISO(),
        },
        { onSuccess: reset },
      );
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Forces"
        subtitle={childName}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={startCreate} hitSlop={10}>
            <Text style={styles.add}>
              {adding && !isEditing ? "Fermer" : "+ Ajouter"}
            </Text>
          </Pressable>
        }
      />

      {adding ? (
        <Card>
          <Text style={styles.formTitle}>
            {isEditing ? "Modifier la force" : "Nouvelle force"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ce qu'il ou elle fait bien"
            placeholderTextColor={c.muted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Détails (optionnel)"
            placeholderTextColor={c.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={styles.input}
            placeholder="Emoji (optionnel — ex. 🎨)"
            placeholderTextColor={c.muted}
            value={emoji}
            onChangeText={setEmoji}
          />
          <View style={styles.pills}>
            {CATEGORIES.map((cat) => {
              const on = cat.value === category;
              return (
                <Pressable
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  style={[styles.pill, on && styles.pillOn]}
                >
                  <Text style={[styles.pillText, on && styles.pillTextOn]}>
                    {cat.emoji} {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {create.isError || update.isError ? (
            <ErrorNote message="Impossible d'enregistrer cette force." />
          ) : null}
          <PrimaryButton
            label={isEditing ? "Enregistrer" : "Ajouter"}
            onPress={submit}
            loading={pending}
            disabled={!title.trim()}
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
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => startEdit(s)}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Modifier cette force"
                  hitSlop={8}
                >
                  <Pencil size={18} color={c.muted} />
                </Pressable>
                <Pressable
                  onPress={() => confirmDelete(() => remove.mutate(s.id))}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Supprimer cette force"
                  hitSlop={8}
                >
                  <Trash2 size={18} color={c.muted} />
                </Pressable>
              </View>
            </View>
            {s.description ? (
              <Text style={styles.description}>{s.description}</Text>
            ) : null}
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    add: { color: c.action, fontSize: 16, fontWeight: "600" },
    formTitle: { fontSize: 16, fontWeight: "600", color: c.text },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.card,
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
      borderColor: c.border,
    },
    pillOn: { backgroundColor: c.brand, borderColor: c.brand },
    pillText: { color: c.subtext },
    pillTextOn: { color: "#fff", fontWeight: "600" },
    cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardActions: { flexDirection: "row", alignItems: "center", marginRight: -10 },
    cancelRow: { alignItems: "center", paddingVertical: 8 },
    cancelText: { color: c.muted },
    iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    cardEmoji: { fontSize: 28 },
    cardBody: { flex: 1 },
    name: { fontSize: 17, fontWeight: "600", color: c.text },
    meta: { color: c.subtext, fontSize: 13 },
    description: { color: c.subtext, fontSize: 14, lineHeight: 20 },
    delete: { color: c.danger, marginTop: 4 },
  });
