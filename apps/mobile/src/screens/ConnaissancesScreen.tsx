import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { useNewsList } from "../hooks/use-news";
import type { ConnaissancesProps } from "../navigation/types";

export function ConnaissancesScreen({ navigation }: ConnaissancesProps) {
  const list = useNewsList();

  return (
    <Screen scroll>
      <ScreenHeader
        title="Connaissances"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.intro}>
        <Text style={styles.introText}>
          Une bibliothèque pour les jours difficiles comme pour les jours calmes.
          Lisez à votre rythme — chaque article est écrit pour vous accompagner,
          pas pour vous juger.
        </Text>
      </View>

      {list.isLoading ? (
        <Loader />
      ) : list.isError ? (
        <ErrorNote message="Impossible de charger les articles." />
      ) : list.data && list.data.length > 0 ? (
        list.data.map((article) => (
          <Pressable
            key={article.id}
            onPress={() =>
              navigation.navigate("ConnaissancesArticle", {
                slug: article.slug,
                title: article.title,
              })
            }
          >
            <Card style={styles.articleCard}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              {article.excerpt ? (
                <Text style={styles.articleExcerpt} numberOfLines={3}>
                  {article.excerpt}
                </Text>
              ) : null}
              <Text style={styles.readMore}>Lire l'article ›</Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState
          title="Aucun article pour l'instant"
          body="Revenez bientôt — de nouveaux articles sont ajoutés régulièrement."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  introText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
  articleCard: { gap: 6 },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 22,
  },
  articleExcerpt: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
  readMore: {
    fontSize: 13,
    color: colors.action,
    fontWeight: "500",
    marginTop: 2,
  },
});
