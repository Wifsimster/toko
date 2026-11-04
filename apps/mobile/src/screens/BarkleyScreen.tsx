import { Fragment, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronRight } from "lucide-react-native";

import {
  Card,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { barkley as copy } from "../lib/copy";
import { getAllStepTitles, getStepContent } from "../lib/barkley-content";
import { readingMinutes } from "../lib/reading-time";
import {
  BARKLEY_BLOCKS,
  blockFinished,
  currentStep,
  leafState,
} from "../lib/barkley-path";
import { useTheme, type Palette } from "../lib/theme";
import { useBarkleySteps } from "../hooks/use-barkley";
import { SceneThumb } from "../components/mo/scene-thumb";
import { BarkleyScene } from "../components/mo/barkley-scene";
import { a11yImage } from "../components/mo/mo";
import { barkleyStepScene } from "../lib/mo-themes";
import { backIfPushed } from "../navigation/tabs";
import type { BarkleyProps } from "../navigation/types";

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
  const current = currentStep(
    steps.map((s) => s.stepNumber),
    completed,
  );
  const heroStep = current ?? 10;
  const heroTitle = (current ? steps.find((s) => s.stepNumber === current)?.title : copy.doneTitle) ?? "";
  const heroKicker = current ? copy.stepOf(current) : copy.doneEyebrow;
  const heroMinutes = readingMinutes(getStepContent(heroStep));
  const heroAction = current ? (doneCount === 0 ? copy.start : copy.resume(current)) : copy.review;
  const currentBlock = BARKLEY_BLOCKS.find((b) => current && current >= b.from && current <= b.to);

  const [toggled, setToggled] = useState<ReadonlySet<string>>(new Set());
  const flip = (key: string) =>
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const openStep = (stepNumber: number) =>
    navigation.navigate("BarkleyStep", { childId, childName, stepNumber });

  return (
    <Screen scroll>
      <ScreenHeader
        title={copy.title}
        subtitle={childName}
        onBack={backIfPushed(navigation)}
      />
      <View style={styles.introWrap}>
        <Text style={styles.intro}>{copy.subtitle}</Text>
        <Text style={styles.pehp}>{copy.pehp}</Text>
      </View>

      {stepsQuery.isLoading ? (
        <Loader />
      ) : (
        <>
          <View style={styles.hero}>
            <Text style={styles.heroKicker} importantForAccessibility="no" accessibilityElementsHidden>
              {heroKicker}
            </Text>
            <Text
              style={styles.heroTitle}
              accessibilityRole="header"
              accessibilityLabel={`${heroKicker} · ${heroTitle}`}
            >
              {heroTitle}
            </Text>
            {current ? null : <Text style={styles.heroBody}>{copy.doneBody}</Text>}
            <View style={styles.heroActions}>
              <Pressable
                onPress={() => openStep(heroStep)}
                style={styles.heroButton}
                accessibilityRole="button"
                accessibilityLabel={heroAction}
              >
                <Text style={styles.heroButtonText}>{heroAction}</Text>
                <ArrowRight size={18} color={c.onPrimary} />
              </Pressable>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{copy.readingTime(heroMinutes)}</Text>
              </View>
            </View>
            <BarkleyScene stepNumber={heroStep} section="technique" />
          </View>

          <Card style={styles.pathCard}>
            <View style={styles.pathHead}>
              <Text style={styles.pathTitle} accessibilityRole="header">
                {copy.leafTitle}
              </Text>
              <Text style={styles.pathNote} importantForAccessibility="no" accessibilityElementsHidden>
                {copy.leafNote(doneCount)}
              </Text>
            </View>
            <LeafPath completed={completed} current={current} styles={styles} />
            {current && currentBlock ? (
              <Text style={styles.blockLine}>
                {copy.blockLine(copy.blocks[currentBlock.key].title, doneCount)}
              </Text>
            ) : null}
          </Card>

          {BARKLEY_BLOCKS.map((block) => {
            const blockSteps = steps.filter((s) => s.stepNumber >= block.from && s.stepNumber <= block.to);
            const blockDone = blockSteps.filter((s) => completed.has(s.stepNumber)).length;
            const finished = blockFinished(block, completed, current);
            const open = toggled.has(block.key) ? finished : !finished;
            const info = copy.blocks[block.key];
            const badge = finished ? copy.blockDone : copy.blockCount(blockDone);
            return (
              <View key={block.key} style={styles.block}>
                <Pressable
                  onPress={() => flip(block.key)}
                  style={styles.blockHead}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={`${copy.blockRange(block.from, block.to)}, ${info.title}, ${badge}`}
                >
                  <View style={styles.blockText}>
                    <Text style={styles.blockRange}>{copy.blockRange(block.from, block.to)}</Text>
                    <Text style={styles.blockTitle}>{info.title}</Text>
                    <Text style={styles.blockBody}>{info.body}</Text>
                  </View>
                  <View style={styles.blockBadge}>
                    {finished ? <Check size={14} color={c.muted} strokeWidth={3} /> : null}
                    <Text style={styles.blockBadgeText}>{badge}</Text>
                    {open ? (
                      <ChevronDown size={16} color={c.muted} />
                    ) : (
                      <ChevronRight size={16} color={c.muted} />
                    )}
                  </View>
                </Pressable>

                {open
                  ? blockSteps.map((s) => {
                      const done = completed.has(s.stepNumber);
                      return (
                        <Pressable
                          key={s.stepNumber}
                          onPress={() => openStep(s.stepNumber)}
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
                  : null}
              </View>
            );
          })}
        </>
      )}
    </Screen>
  );
}

function Leaf({ flip, color }: { flip: boolean; color: string }) {
  return (
    <View {...a11yImage(undefined)} style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d="M5 19C5 11 10 5 19 5c0 9-6 14-14 14z"
          fill="#6E9E7C"
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <Path d="M5 19c4-4 7-7 10-10" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

function LeafPath({
  completed,
  current,
  styles,
}: {
  completed: ReadonlySet<number>;
  current: number | null;
  styles: ReturnType<typeof makeStyles>;
}) {
  const c = useTheme();
  return (
    <View style={styles.leafRow} accessibilityRole="list" accessibilityLabel={copy.leafLabel(completed.size)}>
      {Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        const state = leafState(n, completed, current);
        const label =
          state === "done" ? copy.leafDone(n) : state === "current" ? copy.leafCurrent(n) : copy.leafUpcoming(n);
        return (
          <Fragment key={n}>
            {i > 0 ? <View style={styles.leafLine} /> : null}
            <View style={styles.leafSlot} accessible accessibilityLabel={label}>
              {state === "done" ? (
                <Leaf flip={i % 2 === 1} color={c.text} />
              ) : state === "current" ? (
                <View style={styles.leafCurrent}>
                  <Text style={styles.leafCurrentText}>{n}</Text>
                </View>
              ) : (
                <View style={styles.leafDot} />
              )}
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    introWrap: { gap: 2 },
    intro: { fontSize: 15, color: c.text, fontFamily: fonts.medium, lineHeight: 21 },
    pehp: { fontSize: 12, color: c.muted, fontFamily: fonts.body, lineHeight: 17 },
    hero: {
      backgroundColor: c.surfaceHoney,
      borderRadius: 28,
      padding: 18,
      gap: 10,
    },
    heroKicker: { fontFamily: fonts.hand, fontSize: 21, color: c.text },
    heroTitle: {
      fontFamily: fonts.heading,
      fontSize: 23,
      lineHeight: 27,
      letterSpacing: -0.4,
      color: c.text,
    },
    heroBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: c.subtext },
    heroActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
    heroButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 48,
      paddingHorizontal: 20,
      borderRadius: 999,
      backgroundColor: c.primary,
    },
    heroButtonText: { fontFamily: fonts.semibold, fontSize: 16, color: c.onPrimary },
    chip: { backgroundColor: c.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    chipText: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
    pathCard: { gap: 14, borderRadius: 22 },
    pathHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    pathTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
    pathNote: { fontFamily: fonts.hand, fontSize: 19, color: c.brandStrong },
    leafRow: { flexDirection: "row", alignItems: "center" },
    leafLine: { flex: 1, minWidth: 2, height: 2, backgroundColor: c.border },
    leafSlot: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
    leafCurrent: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    leafCurrentText: { fontFamily: fonts.heading, fontSize: 12, color: c.onPrimary },
    leafDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: c.mutedSurface },
    blockLine: { fontFamily: fonts.body, fontSize: 12, color: c.muted },
    block: { gap: 10 },
    blockHead: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 44,
    },
    blockText: { flex: 1, gap: 1 },
    blockRange: { fontFamily: fonts.semibold, fontSize: 12, color: c.alertFg },
    blockTitle: { fontFamily: fonts.heading, fontSize: 18, color: c.text },
    blockBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: c.muted },
    blockBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: c.mutedSurface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    blockBadgeText: { fontFamily: fonts.medium, fontSize: 12, color: c.muted },
    stepCard: { flexDirection: "row", alignItems: "center", gap: 14 },
    stepNum: { fontSize: 12, color: c.muted, fontFamily: fonts.semibold },
    stepBody: { flex: 1, gap: 2 },
    stepTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    stepMetaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    stepMeta: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    stepDone: { fontSize: 13, color: c.successFg, fontFamily: fonts.medium },
  });
