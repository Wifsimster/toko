import type { ReactNode } from "react";
import {
  ActivityIndicator,
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

/**
 * Tokō palette — mirrors the web design system (apps/web/src/app.css).
 * Warm cream surfaces, teal primary, warm-grey text. Values are the sRGB
 * equivalents of the web's oklch tokens (light mode).
 */
export const colors = {
  brand: "#358891", // --primary (teal)
  action: "#358891", // primary action (web uses teal, not indigo)
  secondary: "#e1efe5", // --secondary (sage) — chips/badges
  text: "#221812", // --foreground (warm dark)
  subtext: "#52443b", // softened foreground
  muted: "#6d6059", // --muted-foreground (warm grey)
  border: "#e6e0d9", // --border (warm)
  card: "#fffdfa", // --card (warm near-white)
  bg: "#fdf9f4", // --background (warm cream)
  danger: "#cf4040", // --destructive
  success: "#10b981", // --status-success
  // Tinted callout surfaces (resolved from app.css color-mix tokens).
  infoSurface: "#e8f0fe",
  infoBorder: "#c3d4f9",
  infoFg: "#1d4ed8",
  tipSurface: "#faf3d9",
  tipBorder: "#e8d49b",
  tipFg: "#a37e29",
  successSurface: "#d6f3e6",
  successBorder: "#9ad9bd",
  successFg: "#065f46",
  alertSurface: "#fdeccb",
  alertBorder: "#f0c674",
  alertFg: "#92400e",
} as const;

/**
 * Brand fonts, mirroring the web (--font-heading: Source Serif 4 serif,
 * --font-sans: Plus Jakarta Sans). Loaded in App.tsx via expo-font.
 */
export const fonts = {
  heading: "SourceSerif4_700Bold",
  headingSemibold: "SourceSerif4_600SemiBold",
  body: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

/** Full-screen container. Use `scroll` for content that can overflow. */
export function Screen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
}) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.flex} edges={edges}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.flex, styles.padded]} edges={edges}>
      {children}
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
  return (
    <View style={styles.headerWrap}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={styles.backHit}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={styles.back}>‹ Retour</Text>
        </Pressable>
      ) : null}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Uppercase, letter-spaced section divider ("AUJOURD'HUI", "Ressources"). */
export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type CalloutVariant = "info" | "tip" | "success" | "alert";
const CALLOUT: Record<
  CalloutVariant,
  { surface: string; border: string; fg: string }
> = {
  info: { surface: colors.infoSurface, border: colors.infoBorder, fg: colors.infoFg },
  tip: { surface: colors.tipSurface, border: colors.tipBorder, fg: colors.tipFg },
  success: {
    surface: colors.successSurface,
    border: colors.successBorder,
    fg: colors.successFg,
  },
  alert: {
    surface: colors.alertSurface,
    border: colors.alertBorder,
    fg: colors.alertFg,
  },
};

/** Tinted callout card: icon + uppercase colored label + content. */
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
  const v = CALLOUT[variant];
  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: v.surface, borderColor: v.border },
        style,
      ]}
    >
      {label || icon ? (
        <View style={styles.calloutHead}>
          {icon ? (
            <View style={[styles.calloutIcon, { backgroundColor: v.border }]}>
              {icon}
            </View>
          ) : null}
          {label ? (
            <Text style={[styles.calloutLabel, { color: v.fg }]}>{label}</Text>
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
  const isSecondary = variant === "secondary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.btn,
        size === "sm" && styles.btnSm,
        isSecondary ? styles.btnSecondary : styles.btnPrimary,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.text : "#fff"} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              size === "sm" ? styles.btnTextSm : styles.btnText,
              { color: isSecondary ? colors.text : "#fff" },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** Backwards-compatible primary button. */
export function PrimaryButton(props: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return <Button variant="primary" {...props} />;
}

/** List/entry row: emoji-or-icon circle + title + meta + trailing slot. */
export function EntryCard({
  emoji,
  icon,
  title,
  meta,
  trailing,
  onPress,
  style,
}: {
  emoji?: string;
  icon?: ReactNode;
  title: string;
  meta?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={[styles.entry, style]}
    >
      {emoji || icon ? (
        <View style={styles.entryCircle}>
          {emoji ? <Text style={styles.entryEmoji}>{emoji}</Text> : icon}
        </View>
      ) : null}
      <View style={styles.flex}>
        <Text style={styles.entryTitle}>{title}</Text>
        {meta ? <Text style={styles.entryMeta}>{meta}</Text> : null}
      </View>
      {trailing ? <View style={styles.entryTrailing}>{trailing}</View> : null}
    </Pressable>
  );
}

export function MenuRow({
  emoji,
  icon,
  label,
  hint,
  onPress,
}: {
  emoji?: string;
  icon?: ReactNode;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <EntryCard
      emoji={emoji}
      icon={icon}
      title={label}
      meta={hint}
      onPress={onPress}
      trailing={<Text style={styles.chevron}>›</Text>}
    />
  );
}

/** Selectable horizontal pill row. Keep options ≤ ~5 for ADHD readability. */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>
              {o.label}
            </Text>
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
  return (
    <View style={styles.search}>
      <Search size={18} color={colors.muted} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </View>
  );
}

export function Loader() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator color={colors.action} />
    </View>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <Text style={styles.error}>{message}</Text>;
}

/** Floating action button (fixed bottom-right). */
export function FAB({
  icon,
  onPress,
  label,
}: {
  icon: ReactNode;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.fab}
    >
      {icon}
    </Pressable>
  );
}

/** Horizontal child selector. No-op (renders nothing) for a single child. */
export function ChildSwitcher() {
  const { children, active, setActiveChildId } = useActiveChild();
  if (children.length <= 1) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {children.map((c) => {
        const on = c.id === active?.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => setActiveChildId(c.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  padded: { padding: 24, gap: 16 },
  scrollContent: { padding: 20, gap: 14 },
  headerWrap: { gap: 4, marginBottom: 4 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backHit: { minHeight: 44, justifyContent: "center" },
  back: { color: colors.action, fontSize: 16, fontFamily: fonts.medium },
  title: { fontSize: 26, color: colors.text, fontFamily: fonts.heading },
  subtitle: { fontSize: 15, color: colors.muted, fontFamily: fonts.body },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  entryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  entryEmoji: { fontSize: 22 },
  entryTitle: { fontSize: 16, color: colors.text, fontFamily: fonts.semibold },
  entryMeta: { fontSize: 13, color: colors.muted, marginTop: 2, fontFamily: fonts.body },
  entryTrailing: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 8 },
  chevron: { fontSize: 22, color: "#a89e93" },
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
  btnPrimary: { backgroundColor: colors.action },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.border },
  btnText: { fontSize: 16, fontFamily: fonts.semibold },
  btnTextSm: { fontSize: 14, fontFamily: fonts.semibold },
  buttonDisabled: { opacity: 0.5 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: 38,
    justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.subtext, fontFamily: fonts.medium, fontSize: 14 },
  chipTextOn: { color: "#fff", fontFamily: fonts.semibold },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, fontFamily: fonts.body, padding: 0 },
  empty: { padding: 24, gap: 8, alignItems: "center" },
  emptyTitle: { fontSize: 17, color: colors.text, textAlign: "center", fontFamily: fonts.semibold },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: "center", fontFamily: fonts.body },
  loader: { paddingVertical: 32, alignItems: "center" },
  error: { color: colors.danger, fontSize: 14, fontFamily: fonts.body },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
