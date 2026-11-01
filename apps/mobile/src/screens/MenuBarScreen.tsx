import { useMemo, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, Switch, Text, View } from "react-native";
import { GripVertical } from "lucide-react-native";
import {
  DEFAULT_MOBILE_TABS,
  MOBILE_TAB_IDS,
  MOBILE_TABS_MAX,
  MOBILE_TABS_MIN,
  isDefaultMobileTabs,
  moveMobileTab,
  moveMobileTabTo,
  toggleMobileTab,
  type MobileTabId,
} from "@focusflow/validators";

import { Button, ErrorNote, Screen, ScreenHeader, SectionLabel, fonts } from "../components/ui";
import { SortableList } from "../components/sortable-list";
import { useTheme, type Palette } from "../lib/theme";
import { menuBar as copy } from "../lib/copy";
import { MobileTabsNotSavedError, useSaveMobileTabs } from "../hooks/use-preferences";
import { navIcon } from "../navigation/nav-icons";
import { PLUS_GROUPS, TAB_DEFS, bottomBar } from "../navigation/nav-model";
import { backIfPushed, useMobileTabs } from "../navigation/tabs";
import type { MenuBarProps } from "../navigation/types";

function saveErrorMessage(error: unknown): string {
  if (error instanceof MobileTabsNotSavedError && error.reason === "unsupported") {
    return copy.errorUnsupported;
  }
  if (error instanceof MobileTabsNotSavedError) return copy.errorMismatch;
  return copy.errorGeneric;
}

const same = (a: readonly MobileTabId[], b: readonly MobileTabId[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

const announce = (message: string) => AccessibilityInfo.announceForAccessibility(message);

export function MenuBarScreen({ navigation }: MenuBarProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { tabs } = useMobileTabs();
  const save = useSaveMobileTabs();
  const [draft, setDraft] = useState<MobileTabId[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState<MobileTabId | null>(null);
  const dragBase = useRef<MobileTabId[]>([]);

  const current = draft ?? tabs;
  const currentRef = useRef(current);
  currentRef.current = current;
  const dirty = draft !== null && !same(draft, tabs);
  const full = current.length >= MOBILE_TABS_MAX;
  const others = MOBILE_TAB_IDS.filter((id) => !current.includes(id));
  const preview = bottomBar(current);

  function edit(next: MobileTabId[]) {
    setSaved(false);
    save.reset();
    setDraft(next);
  }

  function toggle(id: MobileTabId) {
    const next = toggleMobileTab(current, id);
    if (same(next, current)) return;
    const name = TAB_DEFS[id].title;
    announce(next.includes(id) ? copy.added(name) : copy.removed(name));
    edit(next);
  }

  function move(id: MobileTabId, delta: -1 | 1) {
    const next = moveMobileTab(current, id, delta);
    if (same(next, current)) return;
    announce(copy.moved(TAB_DEFS[id].title, next.indexOf(id) + 1, next.length));
    edit(next);
  }

  function dragStart(id: MobileTabId) {
    dragBase.current = [...currentRef.current];
    setDragging(id);
  }

  function dragMove(id: MobileTabId, to: number) {
    const next = moveMobileTabTo(dragBase.current, id, to);
    if (!same(next, currentRef.current)) edit(next);
  }

  function dragEnd(id: MobileTabId) {
    setDragging(null);
    const next = currentRef.current;
    if (next.indexOf(id) !== dragBase.current.indexOf(id)) {
      announce(copy.moved(TAB_DEFS[id].title, next.indexOf(id) + 1, next.length));
    }
  }

  function persist(next: MobileTabId[]) {
    save.mutate(next, {
      onSuccess: () => {
        setDraft(null);
        setSaved(true);
        announce(copy.savedAnnounce);
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
    <Screen scroll scrollEnabled={dragging === null} footer={footer}>
      <ScreenHeader title={copy.title} onBack={backIfPushed(navigation)} />
      <Text style={styles.intro}>{copy.intro(MOBILE_TABS_MIN, MOBILE_TABS_MAX)}</Text>

      <SectionLabel>{copy.preview}</SectionLabel>
      <View
        style={styles.preview}
        accessible
        accessibilityLabel={copy.previewLabel(preview.map((t) => t.title).join(", "))}
      >
        {preview.map((tab) => {
          const Icon = navIcon(tab.icon);
          return (
            <View key={tab.route} style={styles.previewItem}>
              <Icon size={22} color={c.muted} />
              <Text style={styles.previewLabel} numberOfLines={1}>
                {tab.title}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionLabel>{copy.inBar}</SectionLabel>
      {current.length > 1 ? <Text style={styles.note}>{copy.dragHint}</Text> : null}
      <SortableList
        items={current}
        renderItem={(id, index) => (
          <TabRow
            id={id}
            on
            position={index + 1}
            count={current.length}
            lifted={dragging === id}
            canUp={index > 0}
            canDown={index < current.length - 1}
            canToggle={current.length > MOBILE_TABS_MIN}
            onToggle={() => toggle(id)}
            onMove={(delta) => move(id, delta)}
            c={c}
          />
        )}
        onDragStart={dragStart}
        onDragMove={dragMove}
        onDragEnd={dragEnd}
      />
      {current.length === MOBILE_TABS_MIN ? <Text style={styles.note}>{copy.keepOne}</Text> : null}

      {others.length ? (
        <>
          <SectionLabel>{copy.available}</SectionLabel>
          {full ? (
            <Text style={styles.fullNote} accessibilityLiveRegion="polite">
              {copy.full(MOBILE_TABS_MAX)}
            </Text>
          ) : null}
          {PLUS_GROUPS.map((group) => {
            const ids = group.items.map((item) => item.id).filter((id) => others.includes(id));
            if (!ids.length) return null;
            return (
              <View key={group.key} style={styles.group}>
                <Text style={styles.groupTitle} accessibilityRole="header">
                  {group.title}
                </Text>
                <View style={styles.list}>
                  {ids.map((id) => (
                    <TabRow
                      key={id}
                      id={id}
                      on={false}
                      canToggle={!full}
                      onToggle={() => toggle(id)}
                      c={c}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </>
      ) : null}

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

function TabRow({
  id,
  on,
  position,
  count,
  lifted = false,
  canUp = false,
  canDown = false,
  canToggle,
  onToggle,
  onMove,
  c,
}: {
  id: MobileTabId;
  on: boolean;
  position?: number;
  count?: number;
  lifted?: boolean;
  canUp?: boolean;
  canDown?: boolean;
  canToggle: boolean;
  onToggle: () => void;
  onMove?: (delta: -1 | 1) => void;
  c: Palette;
}) {
  const styles = useMemo(() => makeStyles(c), [c]);
  const { title, short, icon, description } = TAB_DEFS[id];
  const Icon = navIcon(icon);
  const actions = onMove
    ? [
        ...(canUp ? [{ name: "up", label: copy.up }] : []),
        ...(canDown ? [{ name: "down", label: copy.down }] : []),
      ]
    : [];
  return (
    <View style={[styles.row, onMove && styles.rowSortable, lifted && styles.rowLifted]}>
      {onMove ? (
        <View style={styles.grip}>
          <GripVertical size={20} color={c.muted} />
        </View>
      ) : null}
      <View
        style={styles.rowHead}
        accessible
        accessibilityLabel={position && count ? copy.rowLabel(title, position, count) : title}
        accessibilityHint={actions.length ? copy.moveHint : undefined}
        accessibilityActions={actions}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "up") onMove?.(-1);
          if (e.nativeEvent.actionName === "down") onMove?.(1);
        }}
      >
        <Icon size={22} color={c.brand} />
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{title}</Text>
          <Text style={styles.rowMeta}>
            {position
              ? short === title
                ? copy.position(position)
                : copy.positionAs(position, short)
              : description}
          </Text>
        </View>
      </View>
      <Switch
        value={on}
        onValueChange={onToggle}
        disabled={!canToggle}
        trackColor={{ false: c.border, true: c.brand }}
        thumbColor="#fff"
        accessibilityLabel={copy.switchLabel(title)}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: { fontSize: 15, lineHeight: 21, color: c.subtext, fontFamily: fonts.body },
    preview: {
      flexDirection: "row",
      backgroundColor: c.card,
      borderColor: c.border,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 4,
    },
    previewItem: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 8 },
    previewLabel: { fontSize: 11, fontFamily: fonts.medium, color: c.muted },
    list: { gap: 8 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 64,
      paddingLeft: 14,
      paddingRight: 8,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
    },
    rowSortable: { flexGrow: 1, paddingLeft: 4 },
    rowLifted: { borderColor: c.primary },
    grip: { width: 28, alignItems: "center", marginRight: -4 },
    rowHead: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    rowMeta: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    note: { fontSize: 14, lineHeight: 20, color: c.muted, fontFamily: fonts.body },
    fullNote: {
      fontSize: 15,
      lineHeight: 21,
      color: c.text,
      fontFamily: fonts.medium,
      backgroundColor: c.infoSurface,
      borderColor: c.infoBorder,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
    },
    group: { gap: 8 },
    groupTitle: { fontSize: 14, color: c.subtext, fontFamily: fonts.semibold, marginTop: 4 },
    saved: { fontSize: 14, color: c.successFg, fontFamily: fonts.semibold },
  });
