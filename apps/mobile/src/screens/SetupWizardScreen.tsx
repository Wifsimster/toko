import { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import {
  SETUP_NEED_IDS,
  suggestMobileTabs,
  toggleSetupNeed,
  type MobileTabId,
  type SetupNeedId,
} from "@focusflow/validators";

import { Button, ErrorNote, Screen, fonts } from "../components/ui";
import { BarPreview, MenuBarEditor, saveErrorMessage } from "../components/menu-bar-editor";
import { Mo } from "../components/mo/mo";
import { useTheme, type Palette } from "../lib/theme";
import { menuBar as menuBarCopy, setupWizard as copy } from "../lib/copy";
import { useSaveMobileTabs } from "../hooks/use-preferences";
import { useMobileTabs } from "../navigation/tabs";

const STEPS = 3;
type Step = 0 | 1 | 2;

const STEP_TITLES = [copy.needsTitle, copy.barTitle, copy.doneTitle] as const;

export function SetupWizardScreen({ onClose }: { onClose: () => void }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { tabs } = useMobileTabs();
  const save = useSaveMobileTabs();
  const [step, setStep] = useState<Step>(0);
  const [needs, setNeeds] = useState<SetupNeedId[]>([]);
  const [bar, setBar] = useState<MobileTabId[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `${copy.step(step + 1, STEPS)}. ${STEP_TITLES[step]}`,
    );
  }, [step]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step === 1 && !save.isPending) setStep(0);
      else if (step !== 1) onClose();
      return true;
    });
    return () => sub.remove();
  }, [step, onClose, save.isPending]);

  function showBar() {
    if (!needs.length) {
      onClose();
      return;
    }
    save.reset();
    setBar(suggestMobileTabs(needs));
    setStep(1);
  }

  function confirm() {
    save.mutate(bar, {
      onSuccess: () => {
        setStep(2);
        AccessibilityInfo.announceForAccessibility(copy.doneAnnounce);
      },
    });
  }

  const busy = save.isPending && !save.isPaused;

  const top = (
    <View style={styles.top}>
      <View style={styles.topSide}>
        {step === 1 ? (
          <Pressable
            onPress={() => setStep(0)}
            disabled={busy}
            style={styles.topHit}
            accessibilityRole="button"
            accessibilityLabel={copy.back}
          >
            <Text style={styles.topLink}>{`‹ ${copy.back}`}</Text>
          </Pressable>
        ) : null}
      </View>
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
        {step < 2 ? (
          <Pressable
            onPress={onClose}
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
    const footer = (
      <>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {needs.length ? copy.needsCount(needs.length) : copy.needsNone}
        </Text>
        <Button label={needs.length ? copy.next : copy.keep} onPress={showBar} />
      </>
    );
    return (
      <Screen key="needs" scroll footer={footer}>
        {top}
        <Mo state="accueil" size={72} />
        <Text style={styles.title} accessibilityRole="header">
          {copy.needsTitle}
        </Text>
        <Text style={styles.body}>{copy.needsBody}</Text>
        <View style={styles.list} accessibilityLabel={copy.needsLegend}>
          {SETUP_NEED_IDS.map((id) => (
            <NeedRow
              key={id}
              id={id}
              checked={needs.includes(id)}
              onToggle={() => setNeeds((prev) => toggleSetupNeed(prev, id))}
              c={c}
            />
          ))}
        </View>
      </Screen>
    );
  }

  if (step === 1) {
    const footer = (
      <>
        {save.isError ? <ErrorNote message={saveErrorMessage(save.error)} /> : null}
        {save.isPaused ? (
          <Text style={styles.count} accessibilityLiveRegion="polite">
            {menuBarCopy.offline}
          </Text>
        ) : null}
        <Button label={copy.confirm} onPress={confirm} loading={busy} disabled={save.isPaused} />
      </>
    );
    return (
      <Screen key="bar" scroll scrollEnabled={!dragging} footer={footer}>
        {top}
        <Text style={styles.title} accessibilityRole="header">
          {copy.barTitle}
        </Text>
        <Text style={styles.body}>{copy.barBody}</Text>
        <BarPreview tabs={bar} />
        <Text style={styles.plus}>{copy.barPlus}</Text>
        <MenuBarEditor
          value={bar}
          onChange={(next) => {
            save.reset();
            setBar(next);
          }}
          onDraggingChange={setDragging}
          availableTitle={copy.barAvailable}
        />
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

function NeedRow({
  id,
  checked,
  onToggle,
  c,
}: {
  id: SetupNeedId;
  checked: boolean;
  onToggle: () => void;
  c: Palette;
}) {
  const styles = useMemo(() => makeStyles(c), [c]);
  const { title, body } = copy.needs[id] ?? { title: id, body: "" };
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={title}
      accessibilityHint={body}
      style={({ pressed }) => [styles.need, checked && styles.needOn, pressed && styles.needPressed]}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <Check size={18} color={c.onPrimary} strokeWidth={3} /> : null}
      </View>
      <View style={styles.needText}>
        <Text style={styles.needTitle}>{title}</Text>
        <Text style={styles.needBody}>{body}</Text>
      </View>
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
    list: { gap: 8 },
    need: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      minHeight: 60,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: c.card,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 14,
    },
    needOn: { borderColor: c.primary, backgroundColor: c.surfaceMint },
    needPressed: { opacity: 0.85 },
    box: {
      width: 26,
      height: 26,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: c.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    boxOn: { backgroundColor: c.primary, borderColor: c.primary },
    needText: { flex: 1, gap: 2 },
    needTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    needBody: { fontSize: 13, lineHeight: 18, color: c.muted, fontFamily: fonts.body },
    doneMo: { alignItems: "center", marginTop: 8 },
  });
