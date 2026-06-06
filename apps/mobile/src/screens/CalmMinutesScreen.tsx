import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Leaf } from "lucide-react-native";

import {
  Card,
  CalloutCard,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { calmMinutes as copy } from "../lib/copy";
import { useCalmMinutes } from "../hooks/use-stats";
import { useTheme, type Palette } from "../lib/theme";
import type { CalmMinutesProps } from "../navigation/types";

// Business rule H1: the north-star KPI — minutes of calm earned, shown over the
// last 7 days. Read-only reward that closes the evening check-in loop. The API
// only returns days that have an entry, so we scaffold a fixed 7-day window
// (zeros included) to render a real weekly chart. View-based bars keep the
// bundle light (no charting library).
const WEEKDAY = ["D", "L", "M", "M", "J", "V", "S"];
const BAR_MAX_HEIGHT = 104;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Day = {
  date: string;
  minutes: number;
  weekday: string;
  isToday: boolean;
};

// Fixed window of the last 7 calendar days ending today, filled from the
// sparse API data.
function last7Days(byDate: Map<string, number>): Day[] {
  const today = new Date();
  const out: Day[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    out.push({
      date: iso,
      minutes: byDate.get(iso) ?? 0,
      weekday: WEEKDAY[d.getDay()] ?? "",
      isToday: i === 0,
    });
  }
  return out;
}

export function CalmMinutesScreen({ navigation, route }: CalmMinutesProps) {
  const { childId, childName } = route.params;
  const { data, isLoading } = useCalmMinutes(childId, "week");
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const goBack = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home");

  const days = useMemo(() => {
    if (!data) return [];
    const byDate = new Map(data.daily.map((d) => [d.date, d.minutes]));
    return last7Days(byDate);
  }, [data]);

  const hasData = !!data && data.daysWithEntry > 0;
  const cap = data?.dailyCapMinutes || 0;

  return (
    <Screen scroll>
      <ScreenHeader
        title={copy.title}
        subtitle={childName}
        onBack={goBack}
      />

      {isLoading || !data ? (
        <Loader />
      ) : (
        <>
          <Card style={styles.hero}>
            <View style={styles.headRow}>
              <Leaf size={16} color={c.success} />
              <Text style={styles.weekLabel}>{copy.weekLabel}</Text>
            </View>

            <Text style={styles.total}>{copy.total(data.totalMinutes)}</Text>
            <Text style={styles.subtitle}>
              {hasData
                ? copy.average(data.averagePerDay, data.daysWithEntry)
                : copy.empty}
            </Text>

            <View style={styles.chart}>
              {days.map((d) => {
                const ratio = cap ? Math.min(d.minutes / cap, 1) : 0;
                const height = d.minutes > 0 ? Math.max(ratio * BAR_MAX_HEIGHT, 6) : 0;
                return (
                  <View key={d.date} style={styles.barColumn}>
                    <Text style={styles.barValue}>
                      {d.minutes > 0 ? d.minutes : ""}
                    </Text>
                    <View style={styles.barTrack}>
                      {height > 0 ? (
                        <View
                          style={[
                            styles.barFill,
                            { height },
                            d.isToday && styles.barFillToday,
                          ]}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.barLabel, d.isToday && styles.barLabelToday]}
                    >
                      {d.weekday}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <CalloutCard
            variant="success"
            label={copy.explainTitle}
            icon={<Leaf size={18} color={c.successFg} />}
          >
            <Text style={styles.explainBody}>{copy.explainBody}</Text>
          </CalloutCard>
        </>
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    hero: { gap: 4 },
    headRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    weekLabel: {
      fontSize: 11,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: c.muted,
      fontFamily: fonts.semibold,
    },
    total: {
      fontSize: 44,
      color: c.success,
      fontFamily: fonts.bold,
      fontVariant: ["tabular-nums"],
    },
    subtitle: { fontSize: 14, color: c.muted, fontFamily: fonts.body },
    chart: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 6,
      marginTop: 16,
    },
    barColumn: { flex: 1, alignItems: "center", gap: 6 },
    barValue: {
      fontSize: 11,
      color: c.muted,
      fontFamily: fonts.medium,
      fontVariant: ["tabular-nums"],
      minHeight: 14,
    },
    barTrack: {
      width: "100%",
      height: BAR_MAX_HEIGHT,
      justifyContent: "flex-end",
      backgroundColor: c.secondary,
      borderRadius: 8,
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      backgroundColor: c.successBorder,
      borderRadius: 8,
    },
    barFillToday: { backgroundColor: c.success },
    barLabel: { fontSize: 12, color: c.muted, fontFamily: fonts.medium },
    barLabelToday: { color: c.success, fontFamily: fonts.bold },
    explainBody: {
      fontSize: 14,
      color: c.subtext,
      fontFamily: fonts.body,
      lineHeight: 20,
    },
  });
