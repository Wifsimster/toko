import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ArrowRight, Check, X } from "lucide-react-native";
import type { HomeFocus } from "@focusflow/validators";

import { fonts } from "./ui";
import { Mo, type AppMoState } from "./mo/mo";
import { home as copy, mo as moCopy } from "../lib/copy";
import { useMoTip } from "../lib/mo-tips";
import { useTheme, type Palette } from "../lib/theme";

/** Ce que la carte affiche pour une `HomeFocus` (logique : validators/home-focus). */
function focusView(focus: HomeFocus, childName: string) {
  switch (focus.kind) {
    case "catch-up":
      return {
        kicker: copy.kicker,
        title: copy.catchUpTitle(childName),
        body: copy.catchUpBody(focus.days),
        mo: "accueil" as AppMoState,
        action: true,
      };
    case "evening":
      return {
        kicker: copy.kicker,
        title: copy.eveningTitle,
        body: copy.eveningBody(childName),
        mo: "accueil" as AppMoState,
        action: true,
      };
    case "routine":
      return {
        kicker: copy.kicker,
        title: focus.routine.name,
        body: copy.routineBody(focus.routine.doneCount, focus.routine.stepCount),
        mo: "guide" as AppMoState,
        action: true,
      };
    case "all-done":
      return {
        kicker: copy.kickerDone,
        title: copy.allDoneTitle(childName),
        body: copy.allDoneBody,
        mo: "fierte" as AppMoState,
        action: false,
      };
    case "nothing-pressing":
      return {
        kicker: copy.kickerCalm,
        title: copy.calmTitle(childName),
        body: copy.calmBody,
        mo: "calme" as AppMoState,
        action: false,
      };
  }
}

/**
 * La carte « une seule chose » de l'accueil : Mō propose l'action la plus
 * utile du moment, avec un seul bouton « Commencer », et l'état du jour en
 * dessous (lu, pas coché ici). Le conseil du jour est replié dans la bulle
 * « Un conseil ? » de Mō : un tap l'ouvre dans la carte, sous le bouton
 * (jamais au-dessus de l'action du jour), la croix le masque pour de bon
 * (`useMoTip().dismiss`). C'est le seul Mō de l'écran, hors
 * visages du sélecteur d'humeur.
 */
export function HomeFocusCard({
  focus,
  childName,
  eveningDone,
  journalDone,
  onStart,
}: {
  focus: HomeFocus;
  childName: string;
  eveningDone: boolean;
  journalDone: boolean;
  onStart: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { fontScale } = useWindowDimensions();
  const { tip, dismiss } = useMoTip("home");
  const [tipOpen, setTipOpen] = useState(false);
  const v = focusView(focus, childName);
  // Grande police : Mō rétrécit pour laisser la place au titre.
  const moSize = fontScale >= 1.3 ? 64 : 84;

  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.headText}>
          {/* Note manuscrite décorative : le titre porte le sens. */}
          <Text style={s.kicker} importantForAccessibility="no" accessibilityElementsHidden>
            {v.kicker}
          </Text>
          <Text style={s.title} accessibilityRole="header">
            {v.title}
          </Text>
          <Text style={s.body}>{v.body}</Text>
        </View>
        <View style={s.moCol}>
          {tip ? (
            <Pressable
              onPress={() => setTipOpen((o) => !o)}
              hitSlop={8}
              style={s.bubble}
              accessibilityRole="button"
              accessibilityState={{ expanded: tipOpen }}
              accessibilityLabel={copy.tipBubble}
            >
              <Text style={s.bubbleText}>{copy.tipBubble}</Text>
              <View style={s.bubbleTail} />
            </Pressable>
          ) : null}
          <Mo state={v.mo} size={moSize} />
        </View>
      </View>

      {v.action ? (
        <Pressable
          onPress={onStart}
          style={s.start}
          accessibilityRole="button"
          accessibilityLabel={copy.startLabel(v.title)}
        >
          <Text style={s.startText}>{copy.start}</Text>
          <ArrowRight size={20} color={c.onPrimary} />
        </Pressable>
      ) : null}

      {tip && tipOpen ? (
        <View style={s.tip}>
          <View
            style={s.tipTextCol}
            accessible
            accessibilityRole="text"
            accessibilityLabel={moCopy.says(tip.text)}
          >
            <Text style={s.tipTitle}>{copy.tipTitle}</Text>
            <Text style={s.tipText}>{tip.text}</Text>
          </View>
          <Pressable
            onPress={() => {
              dismiss();
              setTipOpen(false);
            }}
            style={s.tipClose}
            accessibilityRole="button"
            accessibilityLabel={copy.tipHide}
          >
            <X size={18} color={c.muted} />
          </Pressable>
        </View>
      ) : null}

      <View style={s.divider} />
      <View style={s.states}>
        <DayState label={copy.checkEvening} done={eveningDone} />
        <DayState label={copy.checkJournal} done={journalDone} />
      </View>
    </View>
  );
}

function DayState({ label, done }: { label: string; done: boolean }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View
      style={s.state}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label} : ${done ? copy.done : copy.notYet}`}
    >
      <View style={[s.tick, done && s.tickOn]}>
        {done ? <Check size={13} color={c.onPrimary} strokeWidth={3} /> : null}
      </View>
      <Text style={s.stateText}>{label}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surfaceMint,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      gap: 10,
    },
    head: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
    headText: { flex: 1, gap: 2 },
    kicker: { fontFamily: fonts.hand, fontSize: 19, color: c.text },
    title: {
      fontFamily: fonts.heading,
      fontSize: 21,
      lineHeight: 25,
      letterSpacing: -0.4,
      color: c.text,
    },
    body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: c.subtext, marginTop: 2 },
    moCol: { alignItems: "center", gap: 6 },
    bubble: {
      minHeight: 30,
      paddingHorizontal: 10,
      justifyContent: "center",
      borderRadius: 15,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    bubbleText: { fontFamily: fonts.semibold, fontSize: 13, color: c.text },
    bubbleTail: {
      position: "absolute",
      bottom: -5,
      alignSelf: "center",
      width: 9,
      height: 9,
      backgroundColor: c.card,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: c.border,
      transform: [{ rotate: "45deg" }],
    },
    tip: {
      flexDirection: "row",
      gap: 4,
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 10,
      paddingLeft: 12,
    },
    tipTextCol: { flex: 1, gap: 2 },
    tipTitle: { fontFamily: fonts.semibold, fontSize: 12, color: c.muted },
    tipText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: c.text },
    tipClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginTop: -8 },
    start: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minHeight: 50,
      borderRadius: 999,
      backgroundColor: c.primary,
    },
    startText: { fontFamily: fonts.semibold, fontSize: 17, color: c.onPrimary },
    divider: { height: 1, backgroundColor: "rgba(30, 42, 46, 0.12)" },
    states: { flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 6 },
    state: { flexDirection: "row", alignItems: "center", gap: 7 },
    tick: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: c.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    tickOn: { backgroundColor: c.brand, borderColor: c.brand },
    stateText: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  });
