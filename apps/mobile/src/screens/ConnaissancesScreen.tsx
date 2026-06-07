import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card, Screen, ScreenHeader, fonts } from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import { featuredArticle, knowledgeArticles } from "../lib/knowledge";
import { useReadArticles } from "../lib/reading";
import type { ConnaissancesProps } from "../navigation/types";

// Display order of subjects (mirrors the web /connaissances grouping).
const SUBJECT_ORDER = [
  "Connaissance TDAH",
  "Guide de gestion Barkley",
  "Ressources pour les parents",
  "Parcours de soin en France",
  "Ressources pour l'entourage",
];

// Normalise the article cluster into a top-level subject (strips "Pillar · ").
function subjectOf(cluster: string): string {
  const c = cluster.replace(/^Pillar\s*·\s*/, "").trim();
  return SUBJECT_ORDER.includes(c) ? c : c || "Autres";
}

export function ConnaissancesScreen({ navigation }: ConnaissancesProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { markRead } = useReadArticles();
  const featured = featuredArticle();
  const groups = SUBJECT_ORDER.map((subject) => ({
    subject,
    items: knowledgeArticles.filter(
      (a) => subjectOf(a.cluster) === subject && a.slug !== featured?.slug,
    ),
  })).filter((g) => g.items.length > 0);

  function openArticle(slug: string, title: string) {
    markRead(slug);
    navigation.navigate("ConnaissancesArticle", { slug, title });
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Connaissances" onBack={() => navigation.goBack()} />

      <View style={styles.intro}>
        <Text style={styles.introText}>
          Une bibliothèque pour les jours difficiles comme pour les jours calmes.
          Lisez à votre rythme — chaque article est écrit pour vous accompagner,
          pas pour vous juger.
        </Text>
      </View>

      {featured ? (
        <Pressable onPress={() => openArticle(featured.slug, featured.title)}>
          <Card style={styles.featuredCard}>
            <Text style={styles.featuredLabel}>À LA UNE</Text>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            {featured.excerpt ? (
              <Text style={styles.featuredExcerpt} numberOfLines={3}>
                {featured.excerpt}
              </Text>
            ) : null}
            <Text style={styles.readMore}>
              {featured.readTime} de lecture · Lire ›
            </Text>
          </Card>
        </Pressable>
      ) : null}

      {groups.map((group) => (
        <View key={group.subject} style={styles.group}>
          <Text style={styles.groupTitle}>{group.subject}</Text>
          {group.items.map((article) => (
            <Pressable
              key={article.slug}
              onPress={() => openArticle(article.slug, article.title)}
            >
              <Card style={styles.articleCard}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.readTime}>{article.readTime} de lecture</Text>
                {article.excerpt ? (
                  <Text style={styles.excerpt} numberOfLines={3}>
                    {article.excerpt}
                  </Text>
                ) : null}
                <Text style={styles.readMore}>Lire l'article ›</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: {
      backgroundColor: c.infoSurface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: c.infoBorder,
    },
    introText: { fontSize: 14, color: c.infoFg, lineHeight: 20 },
    group: { gap: 12 },
    groupTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
      marginTop: 8,
    },
    featuredCard: { gap: 6, borderColor: c.brand, backgroundColor: c.secondary },
    featuredLabel: {
      fontSize: 11,
      letterSpacing: 0.8,
      color: c.brand,
      fontFamily: fonts.bold,
    },
    featuredTitle: { fontSize: 19, color: c.text, fontFamily: fonts.heading },
    featuredExcerpt: { fontSize: 14, color: c.subtext, lineHeight: 20 },
    articleCard: { gap: 4 },
    articleTitle: { fontSize: 16, fontWeight: "600", color: c.text },
    readTime: { fontSize: 12, color: c.muted },
    excerpt: { fontSize: 14, color: c.subtext, lineHeight: 20 },
    readMore: { color: c.action, marginTop: 2 },
  });
