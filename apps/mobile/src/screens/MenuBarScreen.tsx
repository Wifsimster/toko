import { useMemo, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text } from "react-native";
import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TABS_MAX,
  MOBILE_TABS_MIN,
  isDefaultMobileTabs,
  type MobileTabId,
} from "@focusflow/validators";

import { Button, ErrorNote, Screen, ScreenHeader, SectionLabel, fonts } from "../components/ui";
import { BarPreview, MenuBarEditor, sameTabs, saveErrorMessage } from "../components/menu-bar-editor";
import { useTheme, type Palette } from "../lib/theme";
import { menuBar as copy, setupWizard as wizardCopy } from "../lib/copy";
import { useSaveMobileTabs } from "../hooks/use-preferences";
import { backIfPushed, useMobileTabs } from "../navigation/tabs";
import { useSetupWizard } from "../navigation/setup-wizard";
import type { MenuBarProps } from "../navigation/types";

export function MenuBarScreen({ navigation }: MenuBarProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { tabs } = useMobileTabs();
  const wizard = useSetupWizard();
  const save = useSaveMobileTabs();
  const [draft, setDraft] = useState<MobileTabId[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);

  const current = draft ?? tabs;
  const dirty = draft !== null && !sameTabs(draft, tabs);

  function edit(next: MobileTabId[]) {
    setSaved(false);
    save.reset();
    setDraft(next);
  }

  function persist(next: MobileTabId[]) {
    save.mutate(next, {
      onSuccess: () => {
        setDraft(null);
        setSaved(true);
        AccessibilityInfo.announceForAccessibility(copy.savedAnnounce);
      },
    });
  }

  const footer = (
    <>
      {save.isError ? <ErrorNote message={saveErrorMessage(save.error)} /> : null}
      {save.isPaused ? (
        <Text style={styles.note} accessibilityLiveRegion="polite">
          {copy.offline}
        </Text>
      ) : null}
      {saved && !dirty ? (
        <Text style={styles.saved} accessibilityLiveRegion="polite">
          {copy.saved}
        </Text>
      ) : null}
      <Button
        label={copy.save}
        onPress={() => persist(current)}
        disabled={!dirty}
        loading={save.isPending && !save.isPaused}
      />
    </>
  );

  return (
    <Screen scroll scrollEnabled={!dragging} footer={footer}>
      <ScreenHeader title={copy.title} onBack={backIfPushed(navigation)} />
      <Text style={styles.intro}>{copy.intro(MOBILE_TABS_MIN, MOBILE_TABS_MAX)}</Text>

      <SectionLabel>{copy.preview}</SectionLabel>
      <BarPreview tabs={current} />

      <MenuBarEditor value={current} onChange={edit} onDraggingChange={setDragging} />

      <SectionLabel>{wizardCopy.relaunchSection}</SectionLabel>
      <Text style={styles.note}>{wizardCopy.relaunchHint}</Text>
      <Button
        label={wizardCopy.relaunch}
        variant="secondary"
        onPress={() => {
          setDraft(null);
          setSaved(false);
          save.reset();
          wizard.start("relaunch");
        }}
        disabled={save.isPending}
      />
      <Button
        label={copy.reset}
        variant="secondary"
        onPress={() => {
          setDraft([...DEFAULT_MOBILE_TABS]);
          persist([...DEFAULT_MOBILE_TABS]);
        }}
        disabled={save.isPending || (isDefaultMobileTabs(current) && !dirty)}
      />
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: { fontSize: 15, lineHeight: 21, color: c.subtext, fontFamily: fonts.body },
    note: { fontSize: 14, lineHeight: 20, color: c.muted, fontFamily: fonts.body },
    saved: { fontSize: 14, color: c.successFg, fontFamily: fonts.semibold },
  });
