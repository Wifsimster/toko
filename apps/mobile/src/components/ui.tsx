import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useActiveChild } from "../lib/active-child";

/** Tokō palette — brand teal + indigo action, mirrored from the web. */
export const colors = {
  brand: "#358891",
  action: "#4f46e5",
  text: "#18181b",
  subtext: "#52525b",
  muted: "#71717a",
  border: "#e4e4e7",
  card: "#ffffff",
  bg: "#fafafa",
  danger: "#dc2626",
  success: "#16a34a",
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
        <Pressable onPress={onBack} hitSlop={12}>
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

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function MenuRow({
  emoji,
  label,
  hint,
  onPress,
}: {
  emoji: string;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.flex}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
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

/** Horizontal child selector. No-op (renders nothing) for a single child. */
export function ChildSwitcher() {
  const { children, active, setActiveChildId } = useActiveChild();
  if (children.length <= 1) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.switcher}
    >
      {children.map((c) => {
        const isActive = c.id === active?.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => setActiveChildId(c.id)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
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
  scrollContent: { padding: 24, gap: 16 },
  headerWrap: { gap: 6 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { color: colors.action, fontSize: 16, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  rowEmoji: { fontSize: 22 },
  rowLabel: { fontSize: 17, fontWeight: "500", color: colors.text },
  rowHint: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 22, color: "#a1a1aa" },
  button: {
    backgroundColor: colors.action,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  empty: { padding: 24, gap: 8, alignItems: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: colors.text, textAlign: "center" },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: "center" },
  loader: { paddingVertical: 32, alignItems: "center" },
  error: { color: colors.danger, fontSize: 14 },
  switcher: { gap: 8, paddingVertical: 4 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  pillText: { color: colors.subtext, fontWeight: "500" },
  pillTextActive: { color: "#fff" },
});
