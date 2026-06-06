import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { eveningCheck as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import {
  useCreateSymptom,
  useSymptoms,
  useUpdateSymptom,
} from "../hooks/use-symptoms";

// Faithful React Native port of apps/web/src/components/dashboard/evening-check.tsx
// (business rule B3): three smileys for the whole evening, one sub-choice for the
// pain point when it was hard. Two taps, under two seconds. The native screen is
// the reason this app isn't a TWA — it's reachable from the reliable scheduled
// reminder (see src/lib/notifications.ts).

const VIBES = [
  { id: "hard", emoji: "😵", mood: 2, agitation: 8, label: copy.vibe_hard },
  { id: "ok", emoji: "😐", mood: 6, agitation: 5, label: copy.vibe_ok },
  { id: "top", emoji: "😊", mood: 9, agitation: 2, label: copy.vibe_top },
] as const;

type Vibe = (typeof VIBES)[number];

const PAIN_POINTS = [
  { id: "shower", label: copy.pain_shower },
  { id: "homework", label: copy.pain_homework },
  { id: "bedtime", label: copy.pain_bedtime },
  { id: "meal", label: copy.pain_meal },
] as const;

type PainPoint = (typeof PAIN_POINTS)[number]["id"];

const NEUTRAL = {
  agitation: 5,
  focus: 5,
  impulse: 5,
  mood: 5,
  sleep: 5,
  routinesOk: true,
};

type Props = {
  childId: string;
  childName: string;
  onBack: () => void;
};

export function EveningCheckinScreen({ childId, childName, onBack }: Props) {
  const { data: symptoms } = useSymptoms(childId);
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  const [pendingHard, setPendingHard] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = todayISO();
  const todayEntry = symptoms?.find((s) => s.date === today) ?? null;
  const isPending = createSymptom.isPending || updateSymptom.isPending;

  function persist(vibe: Vibe, painPoint: PainPoint | null) {
    const patch = {
      mood: vibe.mood,
      agitation: vibe.agitation,
      context: painPoint ?? undefined,
      routinesOk: vibe.id !== "hard",
    };

    const onSuccess = () => {
      setPendingHard(false);
      setSaved(true);
    };

    if (todayEntry) {
      updateSymptom.mutate(
        { id: todayEntry.id, childId, ...patch },
        { onSuccess },
      );
    } else {
      createSymptom.mutate(
        { childId, date: today, ...NEUTRAL, ...patch },
        { onSuccess },
      );
    }
  }

  function handleVibe(vibe: Vibe) {
    if (vibe.id === "hard") {
      setPendingHard(true);
      return;
    }
    persist(vibe, null);
  }

  function handlePain(point: PainPoint) {
    const hard = VIBES[0];
    persist(hard, point);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>‹ {childName}</Text>
      </Pressable>

      <Text style={styles.title}>{copy.title}</Text>

      {saved ? (
        <View style={styles.savedBox}>
          <Text style={styles.savedText}>✓ {copy.saved}</Text>
          <Pressable
            onPress={() => {
              setSaved(false);
              setPendingHard(false);
            }}
          >
            <Text style={styles.link}>{copy.edit}</Text>
          </Pressable>
        </View>
      ) : pendingHard ? (
        <View style={styles.section}>
          <Text style={styles.prompt}>{copy.painPrompt}</Text>
          <View style={styles.painGrid}>
            {PAIN_POINTS.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.painButton, isPending && styles.disabled]}
                disabled={isPending}
                onPress={() => handlePain(p.id)}
              >
                <Text style={styles.painLabel}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setPendingHard(false)} disabled={isPending}>
            <Text style={styles.cancel}>{copy.cancel}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.vibeRow}>
          {VIBES.map((v) => (
            <Pressable
              key={v.id}
              style={[styles.vibeButton, isPending && styles.disabled]}
              disabled={isPending}
              onPress={() => handleVibe(v)}
              accessibilityLabel={v.label}
            >
              <Text style={styles.vibeEmoji}>{v.emoji}</Text>
              <Text style={styles.vibeLabel}>{v.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {isPending ? <ActivityIndicator style={styles.spinner} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 20 },
  back: { color: "#4f46e5", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "600" },
  vibeRow: { flexDirection: "row", gap: 12 },
  vibeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  vibeEmoji: { fontSize: 30 },
  vibeLabel: { fontSize: 13, color: "#3f3f46" },
  section: { gap: 12 },
  prompt: { fontSize: 15, color: "#71717a" },
  painGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  painButton: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  painLabel: { fontSize: 15, color: "#3f3f46" },
  cancel: { textAlign: "center", color: "#71717a", paddingTop: 4 },
  savedBox: { gap: 8 },
  savedText: { fontSize: 16, color: "#16a34a", fontWeight: "500" },
  link: { color: "#4f46e5" },
  disabled: { opacity: 0.5 },
  spinner: { marginTop: 4 },
});
