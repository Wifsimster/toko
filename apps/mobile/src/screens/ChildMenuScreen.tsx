import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ChildMenuProps } from "../navigation/types";

// One clear list of actions per child — low cognitive load, one tap each.
// Feature screens are added here as they land (routines, crisis list…).
export function ChildMenuScreen({ navigation, route }: ChildMenuProps) {
  const { childId, childName } = route.params;
  const params = { childId, childName };

  const items = [
    { label: "Point du soir", emoji: "🌙", go: () => navigation.navigate("Checkin", params) },
    { label: "Journal", emoji: "📓", go: () => navigation.navigate("Journal", params) },
    { label: "Minutes calmes", emoji: "🌿", go: () => navigation.navigate("CalmMinutes", params) },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={() => navigation.navigate("Home")} hitSlop={12}>
        <Text style={styles.back}>‹ Mes enfants</Text>
      </Pressable>

      <Text style={styles.title}>{childName}</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable key={item.label} style={styles.row} onPress={item.go}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  back: { color: "#4f46e5", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "600" },
  list: { gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 18,
  },
  emoji: { fontSize: 22 },
  label: { flex: 1, fontSize: 17, fontWeight: "500", color: "#27272a" },
  chevron: { fontSize: 22, color: "#a1a1aa" },
});
