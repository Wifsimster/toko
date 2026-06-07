import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, RotateCcw } from "lucide-react-native";

import {
  CalloutCard,
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { barkley as copy } from "../lib/copy";
import {
  BARKLEY_QUIZZES,
  getStepContent,
  shuffleQuestionOptions,
  type Callout,
} from "../lib/barkley-content";
import { useTheme, type Palette } from "../lib/theme";
import {
  useBarkleySteps,
  useCompleteBarkleyStep,
  useUncompleteBarkleyStep,
} from "../hooks/use-barkley";
import type { BarkleyStepProps } from "../navigation/types";

type Status = "pending" | "correct" | "wrong";

const calloutVariant = (t: Callout["type"]) =>
  t === "warning" ? "alert" : t === "example" ? "info" : "tip";
const calloutLabel = (t: Callout["type"]) =>
  t === "warning" ? copy.calloutWarning : t === "example" ? copy.calloutExample : copy.calloutTip;

export function BarkleyStepScreen({ navigation, route }: BarkleyStepProps) {
  const { childId, childName, stepNumber } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const content = getStepContent(stepNumber);
  const questions = BARKLEY_QUIZZES[stepNumber] ?? [];

  const stepsQuery = useBarkleySteps(childId);
  const completeStep = useCompleteBarkleyStep(childId);
  const uncompleteStep = useUncompleteBarkleyStep(childId);

  const existing = (stepsQuery.data ?? []).find((s) => s.stepNumber === stepNumber);
  const alreadyDone = !!existing;

  // Stable shuffled options per question (do not reshuffle on each render).
  const shuffled = useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, shuffleQuestionOptions(q)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepNumber],
  );

  const [answers, setAnswers] = useState<Record<string, { selected: number; status: Status }>>(
    {},
  );
  const [marked, setMarked] = useState(false);

  const correctCount = Object.values(answers).filter((a) => a.status === "correct").length;
  const allCorrect = questions.length > 0 && correctCount === questions.length;

  // Persist completion the first time every question is right.
  useEffect(() => {
    if (allCorrect && !alreadyDone && !marked && !completeStep.isPending) {
      setMarked(true);
      completeStep.mutate({ childId, stepNumber });
    }
  }, [allCorrect, alreadyDone, marked, completeStep, childId, stepNumber]);

  function answer(qId: string, optionIndex: number) {
    const isCorrect = optionIndex === shuffled[qId]!.correctIndex;
    setAnswers((prev) => ({
      ...prev,
      [qId]: { selected: optionIndex, status: isCorrect ? "correct" : "wrong" },
    }));
  }
  function retry(qId: string) {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  }

  function resetStep() {
    if (existing) uncompleteStep.mutate(existing.id);
    setAnswers({});
    setMarked(false);
  }

  if (!content) {
    return (
      <Screen scroll>
        <ScreenHeader title={copy.step(stepNumber)} subtitle={childName} onBack={() => navigation.goBack()} />
        <EmptyState title="Étape introuvable" />
      </Screen>
    );
  }

  const done = alreadyDone || allCorrect;

  return (
    <Screen scroll>
      <ScreenHeader
        title={content.title}
        subtitle={`${copy.step(stepNumber)} · ${childName}`}
        onBack={() => navigation.goBack()}
      />

      {done ? (
        <CalloutCard variant="success" label={copy.completed} icon={<Check size={18} color={c.successFg} />}>
          <Text style={styles.body}>{copy.markedDone}</Text>
          <Pressable onPress={resetStep} style={styles.resetRow} accessibilityRole="button">
            <RotateCcw size={15} color={c.muted} />
            <Text style={styles.resetText}>{copy.reset}</Text>
          </Pressable>
        </CalloutCard>
      ) : null}

      <Text style={styles.intro}>{content.intro}</Text>

      {/* Comprendre */}
      <Section title={copy.understand} section={content.understand} styles={styles} />
      {/* La technique */}
      <Section title={copy.technique} section={content.technique} styles={styles} />

      {/* Scénarios */}
      {content.scenarios.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.h2}>{copy.scenarios}</Text>
          {content.scenarios.map((sc, i) => (
            <Card key={i}>
              <Text style={styles.scenarioTitle}>{sc.title}</Text>
              <Text style={styles.body}>{sc.body}</Text>
            </Card>
          ))}
        </View>
      ) : null}

      {/* À retenir */}
      {content.keyTakeaways.length > 0 ? (
        <CalloutCard variant="success" label={copy.takeaways}>
          {content.keyTakeaways.map((k, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{k}</Text>
            </View>
          ))}
        </CalloutCard>
      ) : null}

      {/* Exercice */}
      <CalloutCard variant="tip" label={copy.practice}>
        <Text style={styles.body}>{content.practiceExercise}</Text>
      </CalloutCard>

      {/* Quiz */}
      {questions.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.h2}>{copy.quizTitle}</Text>
          <Text style={styles.quizIntro}>{copy.quizIntro}</Text>
          <Text style={styles.quizProgress}>
            {copy.quizProgress(correctCount, questions.length)}
          </Text>
          {questions.map((q) => {
            const a = answers[q.id];
            const opts = shuffled[q.id]!.options;
            return (
              <Card key={q.id}>
                <Text style={styles.question}>{q.question}</Text>
                {opts.map((opt, i) => {
                  const chosen = a?.selected === i;
                  const reveal = a?.status === "correct" || a?.status === "wrong";
                  const isRight = i === shuffled[q.id]!.correctIndex;
                  let optStyle = styles.opt;
                  if (reveal && chosen && a?.status === "correct") optStyle = styles.optCorrect;
                  else if (reveal && chosen && a?.status === "wrong") optStyle = styles.optWrong;
                  else if (reveal && isRight) optStyle = styles.optCorrect;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => a?.status === "correct" ? undefined : answer(q.id, i)}
                      disabled={a?.status === "correct"}
                      style={[styles.optBase, optStyle]}
                      accessibilityRole="button"
                    >
                      <Text style={styles.optText}>{opt}</Text>
                    </Pressable>
                  );
                })}
                {a?.status === "wrong" ? (
                  <View style={styles.feedback}>
                    <Text style={styles.wrongText}>{copy.wrong}</Text>
                    <Text style={styles.explanation}>{q.explanation}</Text>
                    <Pressable onPress={() => retry(q.id)} style={styles.retryBtn} accessibilityRole="button">
                      <Text style={styles.retryText}>{copy.retry}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {a?.status === "correct" ? (
                  <View style={styles.feedback}>
                    <Text style={styles.correctText}>✓ {copy.correct}</Text>
                    <Text style={styles.explanation}>{q.explanation}</Text>
                  </View>
                ) : null}
              </Card>
            );
          })}

          {done ? (
            <CalloutCard variant="success" label={copy.stepDone}>
              <Text style={styles.body}>{copy.markedDone}</Text>
            </CalloutCard>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function Section({
  title,
  section,
  styles,
}: {
  title: string;
  section: { heading: string; body: string; callout?: Callout };
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.h2}>{title}</Text>
      <Text style={styles.h3}>{section.heading}</Text>
      <Text style={styles.body}>{section.body}</Text>
      {section.callout ? (
        <CalloutCard variant={calloutVariant(section.callout.type)} label={calloutLabel(section.callout.type)}>
          <Text style={styles.body}>{section.callout.text}</Text>
        </CalloutCard>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: { fontSize: 16, color: c.text, fontFamily: fonts.body, lineHeight: 24 },
    block: { gap: 8 },
    h2: { fontSize: 20, color: c.text, fontFamily: fonts.heading, marginTop: 4 },
    h3: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    body: { fontSize: 15, color: c.subtext, fontFamily: fonts.body, lineHeight: 22 },
    scenarioTitle: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    bulletRow: { flexDirection: "row", gap: 8 },
    bulletDot: { color: c.successFg, fontFamily: fonts.bold, fontSize: 15, lineHeight: 22 },
    bulletText: { flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.body, lineHeight: 22 },
    quizIntro: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    quizProgress: { fontSize: 14, color: c.brand, fontFamily: fonts.semibold },
    question: { fontSize: 15, color: c.text, fontFamily: fonts.semibold, lineHeight: 21 },
    optBase: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: c.bg,
    },
    opt: {},
    optCorrect: { borderColor: c.successBorder, backgroundColor: c.successSurface },
    optWrong: { borderColor: c.dangerBorder, backgroundColor: c.dangerSurface },
    optText: { fontSize: 14, color: c.text, fontFamily: fonts.body },
    feedback: { gap: 6, marginTop: 2 },
    correctText: { fontSize: 13, color: c.successFg, fontFamily: fonts.semibold },
    wrongText: { fontSize: 13, color: c.dangerFg, fontFamily: fonts.semibold },
    explanation: { fontSize: 13, color: c.subtext, fontFamily: fonts.body, lineHeight: 19 },
    retryBtn: { alignSelf: "flex-start", paddingVertical: 4 },
    retryText: { fontSize: 14, color: c.action, fontFamily: fonts.semibold },
    resetRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    resetText: { fontSize: 14, color: c.muted, fontFamily: fonts.medium },
  });
