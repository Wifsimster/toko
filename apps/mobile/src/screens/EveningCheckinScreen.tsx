import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { eveningCheck as copy } from "../lib/copy";
import { todayISO } from "../lib/date";
import { useTheme, type Palette } from "../lib/theme";
import { useChildren } from "../hooks/use-children";
import {
  useCreateSymptom,
  useSymptoms,
  useUpdateSymptom,
} from "../hooks/use-symptoms";
import type { CheckinProps } from "../navigation/types";

// Faithful React Native port of apps/web/src/components/dashboard/evening-check.tsx
// (business rule B3): three smileys for the whole evening, one sub-choice for the
// pain point when it was hard. Two taps, under two seconds. Reached from the Home
// list (with params) or from the reliable scheduled reminder deep-link (no
// params — we then resolve the child below).

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

export function EveningCheckinScreen({ navigation, route }: CheckinProps) {
  const params = route.params ?? {};
  const children = useChildren();

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const goBack = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home");

  // Resolve the child: explicit params win; otherwise (deep-link from the
  // reminder) auto-pick the only child, or bounce to Home when there are many.
  let childId = params.childId;
  let childName = params.childName;
  if (!childId && children.data) {
    if (children.data.length === 1) {
      childId = children.data[0].id;
      childName = children.data[0].name;
    }
  }

  const noChildToResolve =
    !params.childId && children.isSuccess && children.data.length !== 1;

  useEffect(() => {
    if (noChildToResolve) goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noChildToResolve]);

  if (!childId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={c.action} />
      </View>
    );
  }

  const resolvedName = childName ?? "Retour";

  return (
    <CheckinForm
      childId={childId}
      childName={resolvedName}
      onBack={goBack}
      onViewCalm={() =>
        navigation.navigate("CalmMinutes", {
          childId: childId!,
          childName: resolvedName,
        })
      }
    />
  );
}

function CheckinForm({
  childId,
  childName,
  onBack,
  onViewCalm,
}: {
  childId: string;
  childName: string;
  onBack: () => void;
  onViewCalm: () => void;
}) {
  const { data: symptoms } = useSymptoms(childId);
  const createSymptom = useCreateSymptom();
  const updateSymptom = useUpdateSymptom();

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

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
    persist(VIBES[0], point);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>‹ {childName}</Text>
      </Pressable>

      <Text style={styles.title}>{copy.title}</Text>

      {saved ? (
        <View style={styles.savedBox}>
          <Text style={styles.savedText}>✓ {copy.saved}</Text>
          <Pressable onPress={onViewCalm}>
            <Text style={styles.link}>{copy.viewCalm} ›</Text>
          </Pressable>
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

      {isPending ? <ActivityIndicator style={styles.spinner} color={c.action} /> : null}
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg },
    container: { flex: 1, padding: 24, gap: 20, backgroundColor: c.bg },
    back: { color: c.action, fontSize: 16 },
    title: { fontSize: 22, fontWeight: "600", color: c.text },
    vibeRow: { flexDirection: "row", gap: 12 },
    vibeButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      gap: 4,
    },
    vibeEmoji: { fontSize: 30 },
    vibeLabel: { fontSize: 13, color: c.subtext },
    section: { gap: 12 },
    prompt: { fontSize: 15, color: c.muted },
    painGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    painButton: {
      width: "48%",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    painLabel: { fontSize: 15, color: c.subtext },
    cancel: { textAlign: "center", color: c.muted, paddingTop: 4 },
    savedBox: { gap: 8 },
    savedText: { fontSize: 16, color: c.success, fontWeight: "500" },
    link: { color: c.action },
    disabled: { opacity: 0.5 },
    spinner: { marginTop: 4 },
  });
