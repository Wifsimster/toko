import type { ParentMoodScore } from "@focusflow/validators";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  Card,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useParentMood,
  useUpsertParentMood,
} from "../hooks/use-parent-mood";
import type { BurnoutProps } from "../navigation/types";

// Score 1–5 mirroring parentMoodScoreSchema
type ScoreOption = {
  value: ParentMoodScore;
  emoji: string;
  label: string;
};

const SCORE_OPTIONS: ScoreOption[] = [
  { value: 1, emoji: "😩", label: "Épuisé(e)" },
  { value: 2, emoji: "😔", label: "Fatigué(e)" },
  { value: 3, emoji: "😐", label: "Neutre" },
  { value: 4, emoji: "🙂", label: "En forme" },
  { value: 5, emoji: "😊", label: "Super bien" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function BurnoutScreen({ navigation }: BurnoutProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const history = useParentMood(7);
  const upsert = useUpsertParentMood();

  const [selectedScore, setSelectedScore] = useState<ParentMoodScore | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Today's existing entry (if already logged today)
  const todayEntry = history.data?.find((e) => e.date === todayISO());

  const handleSubmit = () => {
    if (!selectedScore) return;
    upsert.mutate(
      { date: todayISO(), score: selectedScore, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      },
    );
  };

  const handleRetake = () => {
    setSelectedScore(null);
    setNote("");
    setSubmitted(false);
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title="Mon énergie de parent"
        onBack={() => navigation.goBack()}
      />

      {/* Guilt-free intro */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>
          Prendre un instant pour soi, c'est aussi prendre soin de son enfant.
          Il n'y a pas de bonne ou de mauvaise réponse — juste un miroir pour
          mieux vous connaître.
        </Text>
      </Card>

      {history.isLoading ? (
        <Loader />
      ) : submitted || (todayEntry && !selectedScore) ? (
        /* Result / confirmation view */
        <SubmittedView
          score={
            submitted && selectedScore
              ? selectedScore
              : (todayEntry?.score as ParentMoodScore)
          }
          note={submitted ? note : (todayEntry?.note ?? "")}
          onRetake={handleRetake}
        />
      ) : (
        /* Check-in form */
        <Card>
          <Text style={styles.question}>
            Comment vous sentez-vous aujourd'hui en tant que parent ?
          </Text>

          <View style={styles.scoreRow}>
            {SCORE_OPTIONS.map((opt) => {
              const active = selectedScore === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setSelectedScore(opt.value)}
                  style={[styles.scoreOption, active && styles.scoreOptionOn]}
                >
                  <Text style={styles.scoreEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[styles.scoreLabel, active && styles.scoreLabelOn]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={styles.noteInput}
            placeholder="Une pensée à noter ? (optionnel)"
            placeholderTextColor={c.muted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          {upsert.isError ? (
            <ErrorNote message="Impossible d'enregistrer. Réessayez." />
          ) : null}

          <PrimaryButton
            label="Valider"
            onPress={handleSubmit}
            loading={upsert.isPending}
            disabled={!selectedScore}
          />
        </Card>
      )}

      {/* 7-day history strip */}
      {history.data && history.data.length > 0 && (
        <Card>
          <Text style={styles.historyTitle}>Cette semaine</Text>
          <View style={styles.historyRow}>
            {[...history.data].reverse().map((entry) => {
              const opt = SCORE_OPTIONS.find((o) => o.value === entry.score);
              const label = entry.date.slice(5); // MM-DD
              return (
                <View key={entry.id} style={styles.historyDot}>
                  <Text style={styles.historyEmoji}>{opt?.emoji ?? "·"}</Text>
                  <Text style={styles.historyDate}>{label}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}
    </Screen>
  );
}

function SubmittedView({
  score,
  note,
  onRetake,
}: {
  score: ParentMoodScore;
  note: string | null;
  onRetake: () => void;
}) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const opt = SCORE_OPTIONS.find((o) => o.value === score);
  const zone = score <= 2 ? "low" : score === 3 ? "mid" : "high";

  const zoneMessages: Record<string, { title: string; body: string }> = {
    low: {
      title: "Vous méritez du soutien.",
      body: "Les journées difficiles font partie du chemin. Accorder quelques minutes à vous-même peut déjà aider.",
    },
    mid: {
      title: "C'est correct, et c'est déjà bien.",
      body: "Tenir bon au quotidien, c'est une force en soi.",
    },
    high: {
      title: "Vous êtes en pleine forme !",
      body: "Profitez de cette énergie. Votre enfant en bénéficie aussi.",
    },
  };

  const msg = zoneMessages[zone]!;

  return (
    <Card
      style={
        zone === "low"
          ? styles.zoneCardLow
          : zone === "mid"
            ? styles.zoneCardMid
            : styles.zoneCardHigh
      }
    >
      <Text style={styles.zoneEmoji}>{opt?.emoji ?? "·"}</Text>
      <Text style={styles.zoneTitle}>{msg.title}</Text>
      <Text style={styles.zoneBody}>{msg.body}</Text>
      {note ? <Text style={styles.zoneNote}>"{note}"</Text> : null}
      <Pressable onPress={onRetake} hitSlop={8} style={styles.retakeBtn}>
        <Text style={styles.retakeText}>Refaire l'évaluation</Text>
      </Pressable>
    </Card>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    // successSurface/successBorder tokens are green — match the intent of the original #f0fdf9/#bbf7e4
    infoCard: { backgroundColor: c.successSurface, borderColor: c.successBorder },
    infoText: { fontSize: 14, color: c.successFg, lineHeight: 20 },
    question: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
      lineHeight: 22,
    },
    scoreRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
      paddingVertical: 4,
    },
    scoreOption: {
      alignItems: "center",
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      minWidth: 60,
      gap: 4,
    },
    scoreOptionOn: {
      borderColor: c.brand,
      backgroundColor: c.secondary,
    },
    scoreEmoji: { fontSize: 28 },
    scoreLabel: { fontSize: 11, color: c.subtext, textAlign: "center" },
    scoreLabelOn: { color: c.brand, fontWeight: "600" },
    noteInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.card,
      textAlignVertical: "top",
      minHeight: 72,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: c.subtext,
      marginBottom: 4,
    },
    historyRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    historyDot: { alignItems: "center", gap: 2 },
    historyEmoji: { fontSize: 20 },
    historyDate: { fontSize: 10, color: c.muted },
    // Result zone cards — keep semantic green/amber/red in both themes
    zoneCardLow: { borderColor: "#fca5a5", backgroundColor: "#fef2f2" },
    zoneCardMid: { borderColor: "#fde68a", backgroundColor: "#fffbeb" },
    zoneCardHigh: { borderColor: "#86efac", backgroundColor: "#f0fdf4" },
    zoneEmoji: { fontSize: 40, textAlign: "center" },
    zoneTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: c.text,
      textAlign: "center",
    },
    zoneBody: {
      fontSize: 14,
      color: c.subtext,
      lineHeight: 20,
      textAlign: "center",
    },
    zoneNote: {
      fontSize: 13,
      color: c.muted,
      fontStyle: "italic",
      textAlign: "center",
    },
    retakeBtn: { alignSelf: "center", paddingVertical: 4 },
    retakeText: { color: c.action, fontSize: 14 },
  });
