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
import { SceneThumb } from "../components/mo/scene-thumb";
import { barkleyStepScene } from "../lib/mo-themes";
import { backIfPushed } from "../navigation/tabs";
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
        onBack={backIfPushed(navigation)}
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
                <SceneThumb scene={barkleyStepScene(s.stepNumber)} />
                <View style={styles.stepBody}>
                  <Text style={styles.stepNum}>{copy.step(s.stepNumber)}</Text>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <View style={styles.stepMetaRow}>
                    {done ? (
                      <>
                        <Check size={14} color={c.successFg} strokeWidth={3} />
                        <Text style={styles.stepDone}>{copy.completed}</Text>
                      </>
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

      {/* Pas de conseil du jour ici : chaque étape porte déjà sa scène de
          Mō en vignette (un seul Mō par écran, hors vignettes). */}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: { fontSize: 14, color: c.muted, fontFamily: fonts.body, lineHeight: 20 },
    progressCard: { gap: 10 },
    progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    progressLabel: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    progressPct: { fontSize: 20, color: c.brandStrong, fontFamily: fonts.bold },
    barTrack: { height: 8, backgroundColor: c.secondary, borderRadius: 999, overflow: "hidden" },
    barFill: { height: "100%", backgroundColor: c.brand, borderRadius: 999 },
    stepCard: { flexDirection: "row", alignItems: "center", gap: 14 },
    stepNum: { fontSize: 12, color: c.muted, fontFamily: fonts.semibold },
    stepBody: { flex: 1, gap: 2 },
    stepTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    stepMetaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    stepMeta: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    stepDone: { fontSize: 13, color: c.successFg, fontFamily: fonts.medium },
  });
