import { useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";

import { useActiveChild } from "../lib/active-child";
import { Mo } from "./mo/mo";
import { useTheme, type Palette } from "../lib/theme";

export { colors, useTheme, type Palette } from "../lib/theme";

export const fonts = {
  heading: "PlusJakartaSans_800ExtraBold",
  wordmark: "SourceSerif4_600SemiBold",
  body: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  hand: "Caveat_600SemiBold",
} as const;

export function Screen({
  children,
  scroll = false,
  edges = ["top", "bottom", "left", "right"],
  fab,
  dense = false,
  scrollEnabled = true,
  fit = false,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  fab?: ReactNode;
  dense?: boolean;
  scrollEnabled?: boolean;
  fit?: boolean;
  footer?: ReactNode;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [viewportH, setViewportH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const overflows = fit && viewportH > 0 && contentH > viewportH + 1;
  return (
    <SafeAreaView style={s.flex} edges={edges}>
      <ScrollView
        contentContainerStyle={[scroll ? s.scrollContent : s.fillContent, dense && s.denseContent]}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled && (!fit || overflows)}
        showsVerticalScrollIndicator={!fit || overflows}
        onLayout={fit ? (e) => setViewportH(e.nativeEvent.layout.height) : undefined}
        onContentSizeChange={fit ? (_w, h) => setContentH(h) : undefined}
      >
        <View style={[scroll ? s.column : s.fillColumn, dense && s.denseColumn]}>{children}</View>
      </ScrollView>
      {footer ? (
        <View style={s.footer}>
          <View style={s.footerColumn}>{footer}</View>
        </View>
      ) : null}
      {fab}
    </SafeAreaView>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.headerWrap}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={s.backHit}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={s.back}>‹ Retour</Text>
        </Pressable>
      ) : null}
      <View style={s.headerRow}>
        <Text style={s.title}>{title}</Text>
        {right}
      </View>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return <Text style={s.sectionLabel}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return <View style={[s.card, style]}>{children}</View>;
}

type CalloutVariant = "info" | "tip" | "success" | "alert";

export function CalloutCard({
  variant,
  label,
  icon,
  children,
  style,
}: {
  variant: CalloutVariant;
  label?: string;
  icon?: ReactNode;
  children: ReactNode;
  style?: object;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const v = {
    info: { surface: c.infoSurface, border: c.infoBorder, fg: c.infoFg },
    tip: { surface: c.tipSurface, border: c.tipBorder, fg: c.tipFg },
    success: { surface: c.successSurface, border: c.successBorder, fg: c.successFg },
    alert: { surface: c.alertSurface, border: c.alertBorder, fg: c.alertFg },
  }[variant];
  return (
    <View
      style={[s.callout, { backgroundColor: v.surface, borderColor: v.border }, style]}
    >
      {label || icon ? (
        <View style={s.calloutHead}>
          {icon ? (
            <View style={[s.calloutIcon, { backgroundColor: v.border }]}>{icon}</View>
          ) : null}
          {label ? (
            <Text style={[s.calloutLabel, { color: v.fg }]}>{label}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  size = "default",
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  size?: "default" | "sm";
  style?: object;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const isSecondary = variant === "secondary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        s.btn,
        size === "sm" && s.btnSm,
        isSecondary ? s.btnSecondary : s.btnPrimary,
        (disabled || loading) && s.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? c.text : c.onPrimary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              size === "sm" ? s.btnTextSm : s.btnText,
              { color: isSecondary ? c.text : c.onPrimary },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function PrimaryButton(props: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return <Button variant="primary" {...props} />;
}

export function EntryCard({
  icon,
  title,
  meta,
  trailing,
  onPress,
  style,
}: {
  icon?: ReactNode;
  title: string;
  meta?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={[s.entry, style]}
    >
      {icon ? <View style={s.entryCircle}>{icon}</View> : null}
      <View style={s.entryBody}>
        <Text style={s.entryTitle}>{title}</Text>
        {meta ? <Text style={s.entryMeta}>{meta}</Text> : null}
      </View>
      {trailing ? <View style={s.entryTrailing}>{trailing}</View> : null}
    </Pressable>
  );
}

export function MenuRow({
  icon,
  label,
  hint,
  onPress,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <EntryCard
      icon={icon}
      title={label}
      meta={hint}
      onPress={onPress}
      trailing={<Text style={s.chevron}>›</Text>}
    />
  );
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.chipScroll}
      contentContainerStyle={s.chipRow}
    >
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[s.chip, on && s.chipOn]}
          >
            <Text style={[s.chipText, on && s.chipTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Rechercher…",
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.search}>
      <Search size={18} color={c.muted} />
      <TextInput
        style={s.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
      />
    </View>
  );
}

export function EmptyState({
  title,
  body,
  mo,
}: {
  title: string;
  body?: string;
  mo?: boolean | EmptyMoState;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.empty}>
      {mo ? <Mo state={mo === true ? "accueil" : mo} size={EMPTY_MO_SIZE} /> : null}
      <Text style={s.emptyTitle}>{title}</Text>
      {body ? <Text style={s.emptyBody}>{body}</Text> : null}
    </View>
  );
}

export type EmptyMoState = "accueil" | "calme" | "enquete" | "enquete-boite" | "enquete-dessous";

const EMPTY_MO_SIZE = 96;

export function Loader() {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.loader}>
      <ActivityIndicator color={c.brand} />
    </View>
  );
}

export function ErrorNote({ message }: { message: string }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return <Text style={s.error}>{message}</Text>;
}

export function confirmDelete(
  onConfirm: () => void,
  message = "Cette action est définitive.",
) {
  Alert.alert("Supprimer ?", message, [
    { text: "Annuler", style: "cancel" },
    { text: "Supprimer", style: "destructive", onPress: onConfirm },
  ]);
}

export function FAB({
  icon,
  onPress,
  label,
}: {
  icon: ReactNode;
  onPress: () => void;
  label: string;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={s.fab}
    >
      {icon}
    </Pressable>
  );
}

export function ChildSwitcher() {
  const { children, active, setActiveChildId } = useActiveChild();
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  if (children.length <= 1) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.chipScroll}
      contentContainerStyle={s.chipRow}
    >
      {children.map((ch) => {
        const on = ch.id === active?.id;
        return (
          <Pressable
            key={ch.id}
            onPress={() => setActiveChildId(ch.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[s.chip, on && s.chipOn]}
          >
            <Text style={[s.chipText, on && s.chipTextOn]}>{ch.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.bg },
    scrollContent: { padding: 20, alignItems: "center" },
    column: { width: "100%", maxWidth: 600, gap: 14 },
    fillContent: { flexGrow: 1, padding: 24, alignItems: "center" },
    fillColumn: { width: "100%", maxWidth: 600, gap: 16, flexGrow: 1 },
    denseContent: { paddingHorizontal: 20, paddingVertical: 14 },
    denseColumn: { gap: 12 },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: c.bg,
      borderTopWidth: 1,
      borderTopColor: c.border,
      alignItems: "center",
    },
    footerColumn: { width: "100%", maxWidth: 600, gap: 8 },
    headerWrap: { gap: 4, marginBottom: 4 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backHit: { minHeight: 44, justifyContent: "center" },
    back: { color: c.brandStrong, fontSize: 16, fontFamily: fonts.medium },
    title: { fontSize: 26, color: c.text, fontFamily: fonts.heading, letterSpacing: -0.65 },
    subtitle: { fontSize: 15, color: c.muted, fontFamily: fonts.body },
    sectionLabel: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      color: c.muted,
      marginTop: 6,
    },
    card: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 16,
      gap: 8,
    },
    callout: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
    calloutHead: { flexDirection: "row", alignItems: "center", gap: 10 },
    calloutIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    calloutLabel: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    entry: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      minHeight: 60,
    },
    entryBody: { flex: 1 },
    entryCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    entryTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    entryMeta: { fontSize: 13, color: c.muted, marginTop: 2, fontFamily: fonts.body },
    entryTrailing: {
      marginLeft: "auto",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    chevron: { fontSize: 22, color: c.chevron },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
      minHeight: 50,
    },
    btnSm: { paddingVertical: 10, paddingHorizontal: 14, minHeight: 40, borderRadius: 10 },
    btnPrimary: { backgroundColor: c.primary },
    btnSecondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: c.border },
    btnText: { fontSize: 16, fontFamily: fonts.semibold },
    btnTextSm: { fontSize: 14, fontFamily: fonts.semibold },
    buttonDisabled: { opacity: 0.5 },
    chipScroll: { flexGrow: 0, flexShrink: 0 },
    chipRow: { gap: 8, paddingVertical: 2, alignItems: "center" },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      minHeight: 38,
      justifyContent: "center",
    },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.subtext, fontFamily: fonts.medium, fontSize: 14 },
    chipTextOn: { color: c.onPrimary, fontFamily: fonts.semibold },
    search: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    searchInput: { flex: 1, fontSize: 15, color: c.text, fontFamily: fonts.body, padding: 0 },
    empty: { padding: 24, gap: 8, alignItems: "center" },
    emptyTitle: { fontSize: 17, color: c.text, textAlign: "center", fontFamily: fonts.semibold },
    emptyBody: { fontSize: 14, color: c.muted, textAlign: "center", fontFamily: fonts.body },
    loader: { paddingVertical: 32, alignItems: "center" },
    error: { color: c.danger, fontSize: 14, fontFamily: fonts.body },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 6,
    },
  });
