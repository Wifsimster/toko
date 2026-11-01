import { useCallback, useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { SETUP_THEME_IDS, isSetupThemeId, setupThemeTabs } from "@focusflow/validators";
import { onlineManager, useQueryClient } from "@tanstack/react-query";

import { Button, ErrorNote, Screen, fonts } from "../components/ui";
import { BarPreview, saveErrorMessage } from "../components/menu-bar-editor";
import { Mo, type AppMoState } from "../components/mo/mo";
import { ChoiceMo } from "../components/mo/choice-mo";
import { useTheme, type Palette } from "../lib/theme";
import { setupWizard as copy } from "../lib/copy";
import {
  SETUP_THEME_MO,
  SETUP_UNSURE_MO,
  SETUP_WIZARD_STEPS as STEPS,
  setupBack,
  type SetupChoice,
} from "../lib/setup-wizard";
import { SETUP_WIZARD_SAVE_KEY, useSaveMobileTabs } from "../hooks/use-preferences";
import { useMobileTabs } from "../navigation/tabs";
import { TAB_DEFS } from "../navigation/nav-model";

type Step = 0 | 1;

const CHOICE_MO_SIZE = 56;
const CHOICE_MO_STAGGER_MS = 700;

const STEP_ANNOUNCES = [copy.themesTitle, `${copy.doneTitle}. ${copy.doneBody}`] as const;

export function SetupWizardScreen({ onClose }: { onClose: () => void }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const qc = useQueryClient();
  const { tabs } = useMobileTabs();
  const save = useSaveMobileTabs(SETUP_WIZARD_SAVE_KEY);
  const [offline, setOffline] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [choice, setChoice] = useState<SetupChoice>(null);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `${copy.step(step + 1, STEPS)}. ${STEP_ANNOUNCES[step]}`,
    );
  }, [step]);

  const busy = save.isPending && !save.isPaused;
  const resetSave = save.reset;

  const dropPendingSave = useCallback(() => {
    const cache = qc.getMutationCache();
    for (const m of cache.findAll({ mutationKey: SETUP_WIZARD_SAVE_KEY })) {
      if (m.state.status === "pending") cache.remove(m);
    }
    resetSave();
    setOffline(false);
  }, [qc, resetSave]);

  const skip = useCallback(() => {
    dropPendingSave();
    onClose();
  }, [dropPendingSave, onClose]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const back = setupBack(step, busy);
      if (back === "skip") skip();
      else if (back === "close") onClose();
      return true;
    });
    return () => sub.remove();
  }, [step, busy, skip, onClose]);

  function choose(next: SetupChoice) {
    if (next === choice) return;
    dropPendingSave();
    setChoice(next);
  }

  function validate() {
    if (!isSetupThemeId(choice)) {
      skip();
      return;
    }
    if (!onlineManager.isOnline()) {
      setOffline(true);
      return;
    }
    setOffline(false);
    save.mutate(setupThemeTabs(choice), { onSuccess: () => setStep(1) });
  }

  const top = (
    <View style={styles.top}>
      <View style={styles.topSide} />
      <View
        style={styles.progress}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={copy.step(step + 1, STEPS)}
        accessibilityValue={{ min: 1, max: STEPS, now: step + 1 }}
      >
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotOn, i < step && styles.dotDone]} />
          ))}
        </View>
        <Text style={styles.stepText}>{copy.step(step + 1, STEPS)}</Text>
      </View>
      <View style={[styles.topSide, styles.topRight]}>
        {step === 0 ? (
          <Pressable
            onPress={skip}
            disabled={busy}
            style={styles.topHit}
            accessibilityRole="button"
            accessibilityLabel={copy.skipLabel}
          >
            <Text style={styles.topLink}>{copy.skip}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (step === 0) {
    const themed = isSetupThemeId(choice);
    const note = offline || save.isPaused
      ? copy.offline
      : themed
        ? copy.themeChosen
        : choice === "unsure"
          ? copy.keepNote
          : copy.themesNone;
    const footer = (
      <>
        {save.isError ? <ErrorNote message={saveErrorMessage(save.error)} /> : null}
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {note}
        </Text>
        <Button label={themed ? copy.next : copy.keep} onPress={validate} loading={busy} />
      </>
    );
    return (
      <Screen key="themes" scroll footer={footer}>
        {top}
        <Text style={styles.title} accessibilityRole="header">
          {copy.themesTitle}
        </Text>
        <Text style={styles.body}>{copy.themesBody}</Text>
        <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel={copy.themesLegend}>
          {SETUP_THEME_IDS.map((id, index) => {
            const { title, body } = copy.themes[id];
            const tabsLine = copy.themeTabs(
              setupThemeTabs(id)
                .map((tab) => TAB_DEFS[tab].short)
                .join(", "),
            );
            return (
              <ThemeCard
                key={id}
                title={title}
                body={body}
                tabsLine={tabsLine}
                mo={SETUP_THEME_MO[id]}
                moDelayMs={index * CHOICE_MO_STAGGER_MS}
                checked={choice === id}
                disabled={busy}
                onSelect={() => choose(id)}
                c={c}
              />
            );
          })}
          <ThemeCard
            title={copy.unsureTitle}
            body={copy.unsureBody}
            mo={SETUP_UNSURE_MO}
            moDelayMs={SETUP_THEME_IDS.length * CHOICE_MO_STAGGER_MS}
            checked={choice === "unsure"}
            disabled={busy}
            onSelect={() => choose("unsure")}
            c={c}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen key="done" scroll footer={<Button label={copy.start} onPress={onClose} />}>
      {top}
      <View style={styles.doneMo}>
        <Mo state="fierte" size={120} />
      </View>
      <Text style={[styles.title, styles.center]} accessibilityRole="header">
        {copy.doneTitle}
      </Text>
      <Text style={[styles.body, styles.center]}>{copy.doneBody}</Text>
      <BarPreview tabs={tabs} />
      <Text style={[styles.plus, styles.center]}>{copy.doneHint}</Text>
    </Screen>
  );
}

function ThemeCard({
  title,
  body,
  tabsLine,
  mo,
  moDelayMs,
  checked,
  disabled,
  onSelect,
  c,
}: {
  title: string;
  body: string;
  tabsLine?: string;
  mo: AppMoState;
  moDelayMs: number;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
  c: Palette;
}) {
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable
      onPress={onSelect}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={tabsLine ? `${title}. ${body} ${tabsLine}` : `${title}. ${body}`}
      style={({ pressed }) => [styles.card, checked && styles.cardOn, pressed && styles.cardPressed]}
    >
      <View style={[styles.radio, checked && styles.radioOn]}>
        {checked ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{body}</Text>
        {tabsLine ? <Text style={[styles.cardTabs, checked && styles.cardTabsOn]}>{tabsLine}</Text> : null}
      </View>
      <ChoiceMo state={mo} size={CHOICE_MO_SIZE} selected={checked} delayMs={moDelayMs} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    top: { flexDirection: "row", alignItems: "center", minHeight: 44 },
    topSide: { flex: 1, flexDirection: "row" },
    topRight: { justifyContent: "flex-end" },
    topHit: { minHeight: 44, minWidth: 44, justifyContent: "center", paddingHorizontal: 4 },
    topLink: { color: c.brandStrong, fontSize: 16, fontFamily: fonts.semibold },
    progress: { alignItems: "center", gap: 6 },
    stepText: { fontSize: 12, color: c.muted, fontFamily: fonts.medium },
    dots: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
    dotOn: { width: 22, backgroundColor: c.brand },
    dotDone: { backgroundColor: c.brand },
    title: {
      fontSize: 26,
      lineHeight: 31,
      color: c.text,
      fontFamily: fonts.heading,
      letterSpacing: -0.65,
    },
    body: { fontSize: 15, lineHeight: 21, color: c.subtext, fontFamily: fonts.body },
    center: { textAlign: "center" },
    plus: { fontSize: 14, lineHeight: 20, color: c.muted, fontFamily: fonts.body },
    count: { fontSize: 14, lineHeight: 20, color: c.muted, fontFamily: fonts.body },
    list: { gap: 10 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 64,
      paddingVertical: 12,
      paddingLeft: 16,
      paddingRight: 12,
      backgroundColor: c.card,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 16,
    },
    cardOn: { borderColor: c.primary, backgroundColor: c.surfaceMint },
    cardPressed: { opacity: 0.85 },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: c.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    radioOn: { borderColor: c.primary },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary },
    cardText: { flex: 1, gap: 3 },
    cardTitle: { fontSize: 17, lineHeight: 23, color: c.text, fontFamily: fonts.semibold },
    cardBody: { fontSize: 14, lineHeight: 20, color: c.subtext, fontFamily: fonts.body },
    cardTabs: { fontSize: 13, lineHeight: 18, color: c.muted, fontFamily: fonts.medium, marginTop: 2 },
    cardTabsOn: { color: c.brandStrong },
    doneMo: { alignItems: "center", marginTop: 8 },
  });
