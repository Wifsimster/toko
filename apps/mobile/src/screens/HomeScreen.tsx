import { useEffect } from "react";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  Loader,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { scheduleEveningCheckin } from "../lib/notifications";
import type { HomeProps, RootTabParamList } from "../navigation/types";

const DIAGNOSIS_LABELS: Record<string, string> = {
  inattentive: "TDA (inattention)",
  hyperactive: "TDAH (hyperactivité)",
  mixed: "TDAH (mixte)",
  undefined: "Diagnostic non précisé",
};

/**
 * Accueil tab: pick the active child (drives the Suivi & Programme tabs).
 * Tapping a child selects it and jumps to the tracking tab.
 */
export function HomeScreen({ navigation }: HomeProps) {
  const { children, active, setActiveChildId, isLoading } = useActiveChild();
  const { data: session } = authClient.useSession();

  // Arm the reliable evening reminder once the user is in the app.
  useEffect(() => {
    void scheduleEveningCheckin();
  }, []);

  function selectAndOpen(id: string) {
    setActiveChildId(id);
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate("SuiviTab");
  }

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <Screen scroll>
      <ScreenHeader
        title={firstName ? `Bonjour ${firstName}` : "Bonjour"}
        subtitle="Choisissez un enfant pour voir son suivi."
      />

      {isLoading ? (
        <Loader />
      ) : children.length === 0 ? (
        <EmptyState
          title="Aucun enfant pour l'instant"
          body="Ajoutez un enfant depuis le site, il apparaîtra ici."
        />
      ) : (
        children.map((child) => {
          const isActive = child.id === active?.id;
          return (
            <Pressable key={child.id} onPress={() => selectAndOpen(child.id)}>
              <Card style={isActive ? styles.activeCard : undefined}>
                <View style={styles.cardHead}>
                  <Text style={styles.name}>{child.name}</Text>
                  {isActive ? <Text style={styles.badge}>Sélectionné</Text> : null}
                </View>
                <Text style={styles.muted}>
                  {DIAGNOSIS_LABELS[child.diagnosisType ?? "undefined"]}
                </Text>
                <Text style={styles.cta}>Voir le suivi ›</Text>
              </Card>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCard: { borderColor: colors.brand, borderWidth: 2 },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 18, fontWeight: "600", color: colors.text },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
    backgroundColor: "#e0f2f1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  muted: { color: colors.muted },
  cta: { color: colors.action, marginTop: 4 },
});
