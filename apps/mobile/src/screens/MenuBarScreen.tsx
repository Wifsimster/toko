import { useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { ChevronDown, ChevronUp, GripVertical, type LucideIcon } from "lucide-react-native";
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

import {
  Button,
  ErrorNote,
  Screen,
  ScreenHeader,
  SectionLabel,
  fonts,
} from "../components/ui";
import { SortableList } from "../components/sortable-list";
import { useTheme, type Palette } from "../lib/theme";
import { useSaveMobileTabs } from "../hooks/use-preferences";
import { FIXED_TABS, MOBILE_TABS, useMobileTabs } from "../navigation/tabs";
import type { MenuBarProps } from "../navigation/types";

const same = (a: readonly MobileTabId[], b: readonly MobileTabId[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

const announce = (message: string) => AccessibilityInfo.announceForAccessibility(message);

/**
 * Plus › Barre de menu : le parent choisit et ordonne de 1 à 3 onglets entre
 * Accueil et Plus, fixes. L'ordre se change par appui long puis glisser, ou
 * par les boutons Monter / Descendre (lecteur d'écran, gestes difficiles).
 * Les changements restent un brouillon, montré dans l'aperçu, jusqu'à
 * « Enregistrer » ; la barre suit alors, sur tous les téléphones du compte.
 */
export function MenuBarScreen({ navigation }: MenuBarProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { tabs } = useMobileTabs();
  const save = useSaveMobileTabs();
  // null = pas de brouillon : on montre la barre actuelle.
  const [draft, setDraft] = useState<MobileTabId[] | null>(null);
  const [saved, setSaved] = useState(false);
  // Onglet tenu pendant un glisser-déposer, et l'ordre au moment de la prise.
  const [dragging, setDragging] = useState<MobileTabId | null>(null);
  const dragBase = useRef<MobileTabId[]>([]);

  const current = draft ?? tabs;
  const currentRef = useRef(current);
  currentRef.current = current;
  const dirty = draft !== null && !same(draft, tabs);
  const full = current.length >= MOBILE_TABS_MAX;
  const others = MOBILE_TAB_IDS.filter((id) => !current.includes(id));

  function edit(next: MobileTabId[]) {
    setSaved(false);
    save.reset();
    setDraft(next);
  }

  function toggle(id: MobileTabId) {
    const next = toggleMobileTab(current, id);
    if (same(next, current)) return;
    const label = MOBILE_TABS[id].label;
    announce(next.includes(id) ? `${label} ajouté à la barre` : `${label} retiré de la barre`);
    edit(next);
  }

  function move(id: MobileTabId, delta: -1 | 1) {
    const next = moveMobileTab(current, id, delta);
    if (same(next, current)) return;
    announce(`${MOBILE_TABS[id].label} en position ${next.indexOf(id) + 1} sur ${next.length}`);
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
      announce(`${MOBILE_TABS[id].label} en position ${next.indexOf(id) + 1} sur ${next.length}`);
    }
  }

  function persist(next: MobileTabId[]) {
    // La barre par défaut s'enregistre comme « pas de choix » (null) : le
    // compte suivra un futur changement de la barre par défaut.
    save.mutate(isDefaultMobileTabs(next) ? null : next, {
      onSuccess: () => {
        setDraft(null);
        setSaved(true);
        announce("Barre de menu enregistrée");
      },
    });
  }

  const previewLabel = [
    FIXED_TABS.first.label,
    ...current.map((id) => MOBILE_TABS[id].label),
    FIXED_TABS.last.label,
  ].join(", ");

  return (
    <Screen scroll scrollEnabled={dragging === null}>
      <ScreenHeader title="Barre de menu" onBack={() => navigation.goBack()} />
      <Text style={styles.intro}>
        Choisissez de {MOBILE_TABS_MIN} à {MOBILE_TABS_MAX} onglets entre Accueil et Plus.
        Les autres pages restent dans Plus.
      </Text>

      <SectionLabel>Aperçu</SectionLabel>
      <View
        style={styles.preview}
        accessible
        accessibilityLabel={`Aperçu de la barre : ${previewLabel}`}
      >
        <PreviewItem icon={FIXED_TABS.first.icon} label={FIXED_TABS.first.label} c={c} />
        {current.map((id) => (
          <PreviewItem key={id} icon={MOBILE_TABS[id].icon} label={MOBILE_TABS[id].label} c={c} />
        ))}
        <PreviewItem icon={FIXED_TABS.last.icon} label={FIXED_TABS.last.label} c={c} />
      </View>

      <SectionLabel>Dans la barre, de gauche à droite</SectionLabel>
      {current.length > 1 ? (
        <Text style={styles.note}>Appui long sur un onglet, puis glissez pour le déplacer.</Text>
      ) : null}
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
      {current.length === MOBILE_TABS_MIN ? (
        <Text style={styles.note}>Gardez au moins un onglet entre Accueil et Plus.</Text>
      ) : null}

      {others.length ? (
        <>
          <SectionLabel>Autres onglets</SectionLabel>
          <View style={styles.list}>
            {others.map((id) => (
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
          {full ? (
            <Text style={styles.note}>
              La barre est pleine : retirez un onglet pour en ajouter un autre.
            </Text>
          ) : null}
        </>
      ) : null}

      {save.isError ? (
        <ErrorNote message="La barre n'a pas pu être enregistrée. Vérifiez la connexion, puis réessayez." />
      ) : null}
      {save.isPaused ? (
        <Text style={styles.note} accessibilityLiveRegion="polite">
          Hors ligne : la barre sera enregistrée au retour de la connexion.
        </Text>
      ) : null}
      {saved && !dirty ? (
        <Text style={styles.saved} accessibilityLiveRegion="polite">
          Barre enregistrée.
        </Text>
      ) : null}

      <Button
        label="Enregistrer"
        onPress={() => persist(current)}
        disabled={!dirty}
        loading={save.isPending && !save.isPaused}
      />
      <Button
        label="Rétablir par défaut"
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

function PreviewItem({ icon: Icon, label, c }: { icon: LucideIcon; label: string; c: Palette }) {
  return (
    <View style={previewStyles.item}>
      <Icon size={22} color={c.muted} />
      <Text style={[previewStyles.label, { color: c.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
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
  const { label, icon: Icon } = MOBILE_TABS[id];
  // Actions du lecteur d'écran, en plus des boutons : même effet.
  const actions = onMove
    ? [
        ...(canUp ? [{ name: "up", label: "Monter" }] : []),
        ...(canDown ? [{ name: "down", label: "Descendre" }] : []),
      ]
    : [];
  return (
    <View style={[styles.row, onMove && styles.rowSortable, lifted && styles.rowLifted]}>
      {onMove ? (
        <GripVertical size={20} color={c.muted} style={styles.grip} />
      ) : null}
      <View
        style={styles.rowHead}
        accessible
        accessibilityLabel={
          position && count ? `${label}, position ${position} sur ${count}` : label
        }
        accessibilityActions={actions}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "up") onMove?.(-1);
          if (e.nativeEvent.actionName === "down") onMove?.(1);
        }}
      >
        <Icon size={22} color={c.brand} />
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {position ? <Text style={styles.rowMeta}>Position {position}</Text> : null}
        </View>
      </View>
      {onMove ? (
        <>
          <MoveButton
            icon={ChevronUp}
            label={`Monter ${label}`}
            disabled={!canUp}
            onPress={() => onMove(-1)}
            c={c}
          />
          <MoveButton
            icon={ChevronDown}
            label={`Descendre ${label}`}
            disabled={!canDown}
            onPress={() => onMove(1)}
            c={c}
          />
        </>
      ) : null}
      <Switch
        value={on}
        onValueChange={onToggle}
        disabled={!canToggle}
        trackColor={{ false: c.border, true: c.brand }}
        thumbColor="#fff"
        accessibilityLabel={`${label} dans la barre`}
      />
    </View>
  );
}

function MoveButton({
  icon: Icon,
  label,
  disabled,
  onPress,
  c,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
  c: Palette;
}) {
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.move, disabled && styles.moveDisabled]}
    >
      <Icon size={22} color={c.text} />
    </Pressable>
  );
}

const previewStyles = StyleSheet.create({
  item: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 8 },
  label: { fontSize: 11, fontFamily: fonts.medium },
});

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
    // Dans la liste réordonnable, la ligne remplit sa place mesurée.
    rowSortable: { flexGrow: 1, paddingLeft: 4 },
    // Ligne soulevée : anneau d'encre (sélection), l'ombre vient de la liste.
    rowLifted: { borderColor: c.primary },
    grip: { marginRight: -4 },
    rowHead: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    rowMeta: { fontSize: 13, color: c.muted, fontFamily: fonts.body },
    move: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    moveDisabled: { opacity: 0.3 },
    note: { fontSize: 14, lineHeight: 20, color: c.muted, fontFamily: fonts.body },
    saved: { fontSize: 14, color: c.successFg, fontFamily: fonts.semibold },
  });
