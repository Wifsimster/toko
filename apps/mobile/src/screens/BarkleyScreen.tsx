import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpen, Check, ChevronRight } from "lucide-react-native";

import {
  Card,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { barkley as copy } from "../lib/copy";
import { getAllStepTitles } from "../lib/barkley-content";
import { useTheme, type Palette } from "../lib/theme";
import { useBarkleySteps } from "../hooks/use-barkley";
import type { BarkleyProps } from "../navigation/types";

// Parent-training "formation": the 10-step Barkley program (read each step's
// content, then pass its quiz to complete it). Mirrors the PWA /barkley page.
// The behaviour/star token board lives under Récompenses (matching the web).
export function BarkleyScreen({ navigation, route }: BarkleyProps) {
  const { childId, childName } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const steps = getAllStepTitles();
  const stepsQuery = useBarkleySteps(childId);

  const completed = useMemo(
    () => new Set((stepsQuery.data ?? []).map((s) => s.stepNumber)),
    [stepsQuery.data],
  );
  const doneCount = completed.size;
  const total = steps.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <Screen scroll>
      <ScreenHeader
        title={copy.title}
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.intro}>{copy.subtitle}</Text>

      {/* Progress */}
      <Card style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{copy.progress(doneCount, total)}</Text>
          <Text style={styles.progressPct}>{pct} %</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      </Card>

      {stepsQuery.isLoading ? (
        <Loader />
      ) : (
        steps.map((s) => {
          const done = completed.has(s.stepNumber);
          return (
            <Pressable
              key={s.stepNumber}
              onPress={() =>
                navigation.navigate("BarkleyStep", {
                  childId,
                  childName,
                  stepNumber: s.stepNumber,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`${copy.step(s.stepNumber)} : ${s.title}`}
            >
              <Card style={styles.stepCard}>
                <View
                  style={[styles.badge, done ? styles.badgeDone : styles.badgeTodo]}
                >
                  {done ? (
                    <Check size={18} color="#fff" />
                  ) : (
                    <Text style={styles.badgeNum}>{s.stepNumber}</Text>
                  )}
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <View style={styles.stepMetaRow}>
                    {done ? (
                      <Text style={styles.stepDone}>{copy.completed}</Text>
                    ) : (
                      <>
                        <BookOpen size={13} color={c.muted} />
                        <Text style={styles.stepMeta}>{copy.readAndQuiz}</Text>
                      </>
                    )}
                  </View>
                </View>
                <ChevronRight size={22} color={c.chevron} />
              </Card>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: { fontSize: 14, color: c.muted, fontFamily: fonts.body, lineHeight: 20 },
    progressCard: { gap: 10 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    progressLabel: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    progressPct: { fontSize: 20, color: c.brand, fontFamily: fonts.bold },
    barTrack: { height: 8, backgroundColor: c.secondary, borderRadius: 999, overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: c.brand, borderRadius: 999 },
    stepCard: { flexDirection: "row", alignItems: "center", gap: 14 },
    badge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeDone: { backgroundColor: c.success },
    badgeTodo: { backgroundColor: c.secondary },
    badgeNum: { fontSize: 16, color: c.subtext, fontFamily: fonts.bold },
    stepBody: { flex: 1, gap: 2 },
    stepTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    stepMetaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    stepMeta: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    stepDone: { fontSize: 13, color: c.success, fontFamily: fonts.medium },
  });
