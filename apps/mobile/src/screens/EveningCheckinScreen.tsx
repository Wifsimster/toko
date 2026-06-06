import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, ChevronRight, Moon } from "lucide-react-native";

import {
  Button,
  Card,
  CalloutCard,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
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
      <Screen>
        <Loader />
      </Screen>
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
    <Screen scroll>
      <ScreenHeader title={copy.title} subtitle={childName} onBack={onBack} />

      {saved ? (
        // Warm, intentional confirmation — not a bare line of text.
        <>
          <CalloutCard
            variant="success"
            label="C'est noté"
            icon={<CheckCircle2 size={20} color={c.successFg} />}
          >
            <Text style={styles.savedTitle}>{copy.saved}</Text>
            <Text style={styles.savedBody}>
              Merci d'avoir pris ce petit moment. Une soirée à la fois, c'est
              déjà beaucoup.
            </Text>
          </CalloutCard>

          <Button
            label={copy.viewCalm}
            onPress={onViewCalm}
            icon={<ChevronRight size={18} color="#fff" />}
          />
          <Button
            label={copy.edit}
            variant="secondary"
            onPress={() => {
              setSaved(false);
              setPendingHard(false);
            }}
          />
        </>
      ) : pendingHard ? (
        <Card>
          <Text style={styles.prompt}>{copy.painPrompt}</Text>
          <View style={styles.painGrid}>
            {PAIN_POINTS.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.painButton, isPending && styles.disabled]}
                disabled={isPending}
                onPress={() => handlePain(p.id)}
                accessibilityRole="button"
                accessibilityLabel={p.label}
              >
                <Text style={styles.painLabel}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
          <Button
            label={copy.cancel}
            variant="secondary"
            size="sm"
            onPress={() => setPendingHard(false)}
            disabled={isPending}
          />
        </Card>
      ) : (
        <Card>
          <View style={styles.introRow}>
            <Moon size={18} color={c.muted} />
            <Text style={styles.intro}>
              Un seul geste. Pas de détail à remplir.
            </Text>
          </View>
          <View style={styles.vibeRow}>
            {VIBES.map((v) => (
              <Pressable
                key={v.id}
                style={[styles.vibeButton, isPending && styles.disabled]}
                disabled={isPending}
                onPress={() => handleVibe(v)}
                accessibilityRole="button"
                accessibilityLabel={v.label}
              >
                <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                <Text style={styles.vibeLabel}>{v.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {isPending ? <Loader /> : null}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    introRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    intro: { fontSize: 14, color: c.muted, fontFamily: fonts.body },
    vibeRow: { flexDirection: "row", gap: 12, marginTop: 4 },
    vibeButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: "center",
      gap: 6,
      backgroundColor: c.bg,
    },
    vibeEmoji: { fontSize: 34 },
    vibeLabel: { fontSize: 13, color: c.subtext, fontFamily: fonts.medium },
    prompt: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    painGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
    painButton: {
      width: "47%",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: "center",
      backgroundColor: c.bg,
    },
    painLabel: { fontSize: 15, color: c.text, fontFamily: fonts.medium },
    disabled: { opacity: 0.5 },
    savedTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    savedBody: {
      fontSize: 14,
      color: c.subtext,
      fontFamily: fonts.body,
      lineHeight: 20,
    },
  });
