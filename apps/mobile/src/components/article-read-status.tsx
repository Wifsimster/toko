import type { ArticleReadStatus } from "@focusflow/validators";
import { Check } from "lucide-react-native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { articles as copy } from "../lib/copy";
import { useTheme, type Palette } from "../lib/theme";
import { fonts } from "./ui";

export function ArticleStatusBadge({ status }: { status?: ArticleReadStatus }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  if (status !== "new" && status !== "updated") return null;
  return (
    <View style={s.badge}>
      <View style={s.dot} />
      <Text style={s.badgeText}>{status === "new" ? copy.newBadge : copy.updatedBadge}</Text>
    </View>
  );
}

export function ArticleReadMark({ status }: { status?: ArticleReadStatus }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  if (status !== "read") return null;
  return (
    <View style={s.read}>
      <Check size={13} color={c.muted} />
      <Text style={s.readText}>{copy.readMark}</Text>
    </View>
  );
}

export function UnseenCount({ count }: { count: number }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  if (count <= 0) return null;
  return (
    <View style={[s.badge, s.countBadge]}>
      <View style={s.dot} />
      <Text style={s.badgeText}>{copy.unseenCount(count)}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    countBadge: { marginTop: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.brand },
    badgeText: { fontSize: 12, fontFamily: fonts.semibold, color: c.brandStrong },
    read: { flexDirection: "row", alignItems: "center", gap: 3 },
    readText: { fontSize: 12, fontFamily: fonts.body, color: c.muted },
  });
