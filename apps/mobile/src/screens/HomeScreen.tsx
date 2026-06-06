import { useEffect } from "react";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import * as WebBrowser from "expo-web-browser";
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
import { WEB_URL } from "../lib/config";
import { scheduleEveningCheckin } from "../lib/notifications";
import { pickNextArticle, useReadArticles } from "../lib/reading";
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

      <NextReadingCard />
    </Screen>
  );
}

/**
 * "Prochaine lecture" — suggests the next unread knowledge-base article on the
 * dashboard. One tap opens it and marks it read so the next launch moves on to
 * the following article. Hidden once every article has been read.
 */
function NextReadingCard() {
  const { read, markRead, loaded } = useReadArticles();
  if (!loaded) return null;

  const article = pickNextArticle(read);
  if (!article) return null;

  function open() {
    markRead(article!.slug);
    void WebBrowser.openBrowserAsync(`${WEB_URL}/connaissances/${article!.slug}`);
  }

  return (
    <Pressable onPress={open}>
      <Card style={styles.readingCard}>
        <Text style={styles.readingEyebrow}>📖 Prochaine lecture</Text>
        <Text style={styles.readingTitle}>{article.title}</Text>
        <Text style={styles.readingMeta}>{article.readTime} de lecture</Text>
        <Text style={styles.cta}>Lire l'article ›</Text>
      </Card>
    </Pressable>
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
  readingCard: {
    marginTop: 8,
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  readingEyebrow: { fontSize: 13, fontWeight: "600", color: "#1e40af" },
  readingTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  readingMeta: { fontSize: 12, color: colors.muted },
});
