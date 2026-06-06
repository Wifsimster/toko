import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchBillingStatus } from "../lib/api";
import { authClient } from "../lib/auth";
import { WEB_URL } from "../lib/config";
import { scheduleEveningCheckin } from "../lib/notifications";
import { useChildren } from "../hooks/use-children";
import { useQuery } from "@tanstack/react-query";
import type { HomeProps } from "../navigation/types";

/**
 * Home screen: lists the parent's children (typed by the shared
 * `@focusflow/validators` schema). Tapping a child opens the native evening
 * check-in. Subscription is routed to the web (no in-app purchase).
 */
export function HomeScreen({ navigation }: HomeProps) {
  const children = useChildren();

  const billing = useQuery({
    queryKey: ["billing"],
    queryFn: fetchBillingStatus,
  });

  // Arm the reliable evening reminder once the user is in the app.
  useEffect(() => {
    void scheduleEveningCheckin();
  }, []);

  const isPremium = billing.data?.active || billing.data?.granted;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes enfants</Text>
        <Pressable onPress={() => authClient.signOut()}>
          <Text style={styles.link}>Se déconnecter</Text>
        </Pressable>
      </View>

      {children.isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={children.data ?? []}
          keyExtractor={(child) => child.id}
          ListEmptyComponent={
            <Text style={styles.muted}>Aucun enfant pour l'instant.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate("ChildMenu", {
                  childId: item.id,
                  childName: item.name,
                })
              }
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.muted}>Voir le suivi ›</Text>
            </Pressable>
          )}
        />
      )}

      {billing.isSuccess && !isPremium ? (
        <Pressable
          style={styles.button}
          onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/abonnement`)}
        >
          <Text style={styles.buttonText}>S'abonner sur le site</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "600" },
  link: { color: "#4f46e5" },
  muted: { color: "#71717a" },
  card: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "500" },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
