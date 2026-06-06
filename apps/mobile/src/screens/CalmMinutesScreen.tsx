import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { calmMinutes as copy } from "../lib/copy";
import { useCalmMinutes } from "../hooks/use-stats";
import type { CalmMinutesProps } from "../navigation/types";

// Business rule H1: the north-star KPI — minutes of calm earned, shown over the
// last 7 days. Read-only reward that closes the evening check-in loop. A simple
// View-based bar row keeps the bundle light (no charting library).
const WEEKDAY = ["D", "L", "M", "M", "J", "V", "S"];

const BAR_MAX_HEIGHT = 96;

export function CalmMinutesScreen({ navigation, route }: CalmMinutesProps) {
  const { childId, childName } = route.params;
  const { data, isLoading } = useCalmMinutes(childId, "week");

  const goBack = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home");

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={goBack} hitSlop={12}>
        <Text style={styles.back}>‹ {childName}</Text>
      </Pressable>

      <Text style={styles.title}>{copy.title}</Text>

      {isLoading || !data ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.total}>{copy.total(data.totalMinutes)}</Text>
          <Text style={styles.subtitle}>
            {data.daysWithEntry > 0
              ? copy.average(data.averagePerDay, data.daysWithEntry)
              : copy.empty}
          </Text>

          {data.daysWithEntry > 0 ? (
            <View style={styles.chart}>
              {data.daily.map((d) => {
                const ratio = data.dailyCapMinutes
                  ? Math.min(d.minutes / data.dailyCapMinutes, 1)
                  : 0;
                const weekday = WEEKDAY[new Date(d.date).getDay()] ?? "";
                return (
                  <View key={d.date} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: Math.max(ratio * BAR_MAX_HEIGHT, 2) },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{weekday}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  back: { color: "#4f46e5", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "600" },
  total: {
    fontSize: 40,
    fontWeight: "700",
    color: "#16a34a",
    fontVariant: ["tabular-nums"],
  },
  subtitle: { fontSize: 14, color: "#71717a" },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 16,
    height: BAR_MAX_HEIGHT + 24,
  },
  barColumn: { flex: 1, alignItems: "center", gap: 6 },
  barTrack: {
    width: "100%",
    height: BAR_MAX_HEIGHT,
    justifyContent: "flex-end",
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#86efac",
    borderRadius: 8,
  },
  barLabel: { fontSize: 12, color: "#a1a1aa" },
});
