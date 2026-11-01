import { useMemo, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, Switch, Text, View } from "react-native";
import { GripVertical } from "lucide-react-native";
import {
  MOBILE_TAB_IDS,
  MOBILE_TABS_MAX,
  MOBILE_TABS_MIN,
  moveMobileTab,
  moveMobileTabTo,
  toggleMobileTab,
  type MobileTabId,
} from "@focusflow/validators";

import { SectionLabel, fonts } from "./ui";
import { BarLabel } from "./bar-label";
import { SortableList } from "./sortable-list";
import { useTheme, type Palette } from "../lib/theme";
import { menuBar as copy } from "../lib/copy";
import { MobileTabsNotSavedError } from "../hooks/use-preferences";
import { navIcon } from "../navigation/nav-icons";
import { PLUS_GROUPS, TAB_DEFS, bottomBar } from "../navigation/nav-model";

export const sameTabs = (a: readonly MobileTabId[], b: readonly MobileTabId[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

export function saveErrorMessage(error: unknown): string {
  if (error instanceof MobileTabsNotSavedError && error.reason === "unsupported") {
    return copy.errorUnsupported;
  }
  if (error instanceof MobileTabsNotSavedError) return copy.errorMismatch;
  return copy.errorGeneric;
}

const announce = (message: string) => AccessibilityInfo.announceForAccessibility(message);

export function BarPreview({ tabs }: { tabs: readonly MobileTabId[] }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const preview = bottomBar(tabs);
  return (
    <View
      style={styles.preview}
      accessible
      accessibilityLabel={copy.previewLabel(preview.map((t) => t.title).join(", "))}
    >
      {preview.map((tab) => {
        const Icon = navIcon(tab.icon);
        const chosen = tab.id !== null;
        return (
          <View key={tab.route} style={styles.previewItem}>
            <Icon size={22} color={chosen ? c.brandStrong : c.muted} />
            <BarLabel color={chosen ? c.brandStrong : c.muted} style={chosen && styles.previewChosen}>
              {tab.title}
            </BarLabel>
          </View>
        );
      })}
    </View>
  );
}

export function MenuBarEditor({
  value,
  onChange,
  onDraggingChange,
}: {
  value: readonly MobileTabId[];
  onChange: (next: MobileTabId[]) => void;
  onDraggingChange?: (dragging: boolean) => void;
}) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [dragging, setDragging] = useState<MobileTabId | null>(null);
  const dragBase = useRef<MobileTabId[]>([]);
  const currentRef = useRef(value);
  currentRef.current = value;
  const full = value.length >= MOBILE_TABS_MAX;
  const others = MOBILE_TAB_IDS.filter((id) => !value.includes(id));

  function toggle(id: MobileTabId) {
    const next = toggleMobileTab(value, id);
    if (sameTabs(next, value)) return;
    const name = TAB_DEFS[id].title;
    announce(next.includes(id) ? copy.added(name) : copy.removed(name));
    onChange(next);
  }

  function move(id: MobileTabId, delta: -1 | 1) {
    const next = moveMobileTab(value, id, delta);
    if (sameTabs(next, value)) return;
    announce(copy.moved(TAB_DEFS[id].title, next.indexOf(id) + 1, next.length));
    onChange(next);
  }

  function dragStart(id: MobileTabId) {
    dragBase.current = [...currentRef.current];
    setDragging(id);
    onDraggingChange?.(true);
  }

  function dragMove(id: MobileTabId, to: number) {
    const next = moveMobileTabTo(dragBase.current, id, to);
    if (!sameTabs(next, currentRef.current)) onChange(next);
  }

  function dragEnd(id: MobileTabId) {
    setDragging(null);
    onDraggingChange?.(false);
    const next = currentRef.current;
    if (next.indexOf(id) !== dragBase.current.indexOf(id)) {
      announce(copy.moved(TAB_DEFS[id].title, next.indexOf(id) + 1, next.length));
    }
  }

  return (
    <>
      <SectionLabel>{copy.inBar}</SectionLabel>
      {value.length > 1 ? <Text style={styles.note}>{copy.dragHint}</Text> : null}
      <SortableList
        items={value}
        renderItem={(id, index) => (
          <TabRow
            id={id}
            on
            position={index + 1}
            count={value.length}
            lifted={dragging === id}
            canUp={index > 0}
            canDown={index < value.length - 1}
            canToggle={value.length > MOBILE_TABS_MIN}
            onToggle={() => toggle(id)}
            onMove={(delta) => move(id, delta)}
            c={c}
          />
        )}
        onDragStart={dragStart}
        onDragMove={dragMove}
        onDragEnd={dragEnd}
      />
      {value.length === MOBILE_TABS_MIN ? <Text style={styles.note}>{copy.keepOne}</Text> : null}

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
    </>
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
    preview: {
      flexDirection: "row",
      backgroundColor: c.card,
      borderColor: c.border,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 4,
    },
    previewItem: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 8 },
    previewChosen: { fontFamily: fonts.semibold },
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
  });
