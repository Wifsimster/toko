import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { storedValueForIcon } from "@focusflow/mo/item-icons";
import { ChevronRight, Sparkles } from "lucide-react-native";

import { Mo } from "../mo/mo";
import { ItemIcon } from "../item-icon";
import { fonts } from "../ui";
import { SosScene } from "./sos-scene";
import { sos as copy } from "../../lib/copy";
import { iconFor } from "../../lib/icon-for";
import { useActiveChild } from "../../lib/active-child";
import { useReduceMotion } from "../../lib/reduce-motion";
import { useTheme, type Palette } from "../../lib/theme";
import { useCrisisItems } from "../../hooks/use-crisis-list";
import {
  breathCircleScale,
  breathLevelAt,
  breathPhaseAt,
  type BreathPhase,
  type SosTechnique,
} from "../../lib/sos";

const MO_SIZE = 112;
const CIRCLE_SIZE = 224;

export function TechniqueChooser({ onSelect }: { onSelect: (technique: SosTechnique) => void }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const dots: Record<SosTechnique, { dot: string; ring: string }> = {
    breathing: { dot: c.infoFg, ring: c.infoSurface },
    sensory: { dot: c.chartSage, ring: c.tipSurface },
    diversion: { dot: c.alertFg, ring: c.alertSurface },
  };
  const keys: SosTechnique[] = ["breathing", "sensory", "diversion"];
  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.titleLarge}>
          {copy.title}
        </Text>
        <Text style={styles.lead}>{copy.subtitle}</Text>
      </View>
      <SosScene name="choix" />
      <View style={styles.list}>
        {keys.map((key) => (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={`${copy.techniques[key].title}. ${copy.techniques[key].description}`}
            style={({ pressed }) => [styles.technique, pressed && styles.pressed]}
          >
            <View style={[styles.dotRing, { backgroundColor: dots[key].ring }]}>
              <View style={[styles.dot, { backgroundColor: dots[key].dot }]} />
            </View>
            <View style={styles.techniqueText}>
              <Text style={styles.techniqueTitle}>{copy.techniques[key].title}</Text>
              <Text style={styles.techniqueBody}>{copy.techniques[key].description}</Text>
            </View>
            <ChevronRight size={20} color={c.chevron} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const PHASE_POLL_MS = 250;

export function BreathingView() {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const reduceMotion = useReduceMotion();
  const clock = useSharedValue(0);
  const [phase, setPhase] = useState<BreathPhase>("inhale");

  useFrameCallback((info) => {
    clock.value += info.timeSincePreviousFrame ?? 0;
  }, !reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setPhase(breathPhaseAt(clock.value)), PHASE_POLL_MS);
    return () => clearInterval(id);
  }, [clock, reduceMotion]);

  useEffect(() => {
    if (!reduceMotion) return;
    const start = Date.now();
    const id = setInterval(() => setPhase(breathPhaseAt(Date.now() - start)), PHASE_POLL_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const level = useDerivedValue(() => (reduceMotion ? 0 : breathLevelAt(clock.value)));
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : breathCircleScale(level.value) }],
  }));

  return (
    <View style={styles.blockCenter}>
      <Text accessibilityRole="header" style={styles.title}>
        {copy.breathing.title}
      </Text>
      <View style={styles.circleWrap}>
        <Animated.View style={[styles.circle, circleStyle]} />
        <View style={styles.moWrap}>
          <Mo state="calme" size={MO_SIZE} guidedBreath={level} />
        </View>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.phase}>
        {copy.breathing.phases[phase]}
      </Text>
      <Text style={styles.note}>{copy.breathing.intro}</Text>
    </View>
  );
}

export function SensoryView() {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>
          {copy.sensory.title}
        </Text>
        <Text style={styles.lead}>{copy.sensory.intro}</Text>
      </View>
      <SosScene name="sensoriel" />
      <View style={styles.list}>
        {copy.sensory.steps.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DiversionView({ onEditList }: { onEditList: (child: { id: string; name: string }) => void }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { active } = useActiveChild();
  const { data: custom } = useCrisisItems(active?.id ?? "");
  const usingCustom = !!custom && custom.length > 0;
  const items = usingCustom
    ? custom.map((item) => ({ key: item.id, emoji: item.emoji, label: item.label }))
    : copy.diversion.ideas.map((idea) => ({ key: idea.label, emoji: storedValueForIcon(idea.emoji), label: idea.label }));
  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>
          {copy.diversion.title}
        </Text>
        <Text style={styles.lead}>{usingCustom ? copy.diversion.introCustom : copy.diversion.intro}</Text>
      </View>
      <SosScene name="diversion" maxWidth={210} />
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.key} style={styles.idea}>
            <ItemIcon spec={iconFor({ label: item.label, emoji: item.emoji, kind: "crisis" })} size={28} color={c.brandStrong} />
            <Text style={styles.ideaText}>{item.label}</Text>
          </View>
        ))}
      </View>
      {active ? (
        <Pressable
          onPress={() => onEditList({ id: active.id, name: active.name })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.outline, pressed && styles.pressed]}
        >
          <Sparkles size={16} color={c.text} />
          <Text style={styles.outlineText}>{usingCustom ? copy.diversion.editMyList : copy.diversion.viewMyList}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    block: { width: "100%", gap: 24 },
    blockCenter: { width: "100%", alignItems: "center", gap: 28 },
    head: { gap: 8, alignItems: "center" },
    titleLarge: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34, color: c.text, textAlign: "center" },
    title: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, color: c.text, textAlign: "center" },
    lead: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: c.muted, textAlign: "center" },
    list: { gap: 12 },
    pressed: { opacity: 0.85 },
    technique: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 18,
      minHeight: 44,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    dotRing: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
    dot: { width: 10, height: 10, borderRadius: 5 },
    techniqueText: { flex: 1, gap: 4 },
    techniqueTitle: { fontFamily: fonts.semibold, fontSize: 17, color: c.text },
    techniqueBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.muted },
    circleWrap: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: "center", justifyContent: "center" },
    circle: {
      position: "absolute",
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: CIRCLE_SIZE / 2,
      backgroundColor: c.infoSurface,
      borderWidth: 2,
      borderColor: c.infoBorder,
    },
    moWrap: { transform: [{ translateY: -12 }] },
    phase: { fontFamily: fonts.semibold, fontSize: 26, color: c.text, textAlign: "center" },
    note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center", maxWidth: 360 },
    step: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: { fontFamily: fonts.semibold, fontSize: 14, color: c.brandStrong },
    stepText: { flex: 1, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: c.text },
    idea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    ideaText: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: c.text },
    outline: {
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    outlineText: { fontFamily: fonts.medium, fontSize: 15, color: c.text },
  });
