import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card, Screen, ScreenHeader, fonts } from "../components/ui";
import { Picto } from "../components/mo/companion";
import { useTheme, type Palette } from "../lib/theme";
import { featuredArticle, knowledgeArticles } from "../lib/knowledge";
import { articleScene } from "../lib/mo-themes";
import { SceneThumb } from "../components/mo/scene-thumb";
import { pickNextArticle, useReadArticles } from "../lib/reading";
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
  const { markRead, read, loaded } = useReadArticles();
  // « Prochaine lecture » (venue de l'accueil) : épinglée en tête, le premier
  // article pas encore ouvert.
  const next = loaded ? pickNextArticle(read) : null;
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
      <ScreenHeader title="Articles" onBack={() => navigation.goBack()} />

      <View style={styles.intro}>
        <Text style={styles.introText}>
          Des articles pour les jours difficiles comme pour les jours calmes.
          Lisez à votre rythme — chaque article est écrit pour vous accompagner,
          pas pour vous juger.
        </Text>
      </View>

      {next ? (
        <Pressable
          onPress={() => openArticle(next.slug, next.title)}
          accessibilityRole="button"
        >
          <Card style={styles.nextCard}>
            <View style={styles.featuredHead}>
              <SceneThumb scene={articleScene(next.slug)} />
              <View style={styles.featuredHeadText}>
                <View style={styles.nextHead}>
                  <Picto name="livre" size={22} />
                  <Text style={styles.nextLabel}>Prochaine lecture</Text>
                </View>
                <Text style={styles.nextTitle}>{next.title}</Text>
              </View>
            </View>
            <Text style={styles.readMore}>
              {next.readTime} de lecture · Lire
            </Text>
          </Card>
        </Pressable>
      ) : null}

      {featured && featured.slug !== next?.slug ? (
        <Pressable onPress={() => openArticle(featured.slug, featured.title)}>
          <Card style={styles.featuredCard}>
            <View style={styles.featuredHead}>
              <SceneThumb scene={articleScene(featured.slug)} />
              <View style={styles.featuredHeadText}>
                <Text style={styles.featuredLabel}>À LA UNE</Text>
                <Text style={styles.featuredTitle}>{featured.title}</Text>
              </View>
            </View>
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
                <SceneThumb scene={articleScene(article.slug)} />
                <View style={styles.articleBody}>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.readTime}>{article.readTime} de lecture</Text>
                  {article.excerpt ? (
                    <Text style={styles.excerpt} numberOfLines={3}>
                      {article.excerpt}
                    </Text>
                  ) : null}
                  <Text style={styles.readMore}>Lire l'article ›</Text>
                </View>
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
    nextCard: { gap: 6 },
    nextHead: { flexDirection: "row", alignItems: "center", gap: 6 },
    nextLabel: { color: c.muted, fontFamily: fonts.semibold, fontSize: 13 },
    nextTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 16 },
    featuredCard: { gap: 6, borderColor: c.brand, backgroundColor: c.secondary },
    featuredHead: { flexDirection: "row", alignItems: "center", gap: 14 },
    featuredHeadText: { flex: 1, gap: 4 },
    featuredLabel: {
      fontSize: 11,
      letterSpacing: 0.8,
      color: c.brandStrong,
      fontFamily: fonts.bold,
    },
    featuredTitle: { fontSize: 19, color: c.text, fontFamily: fonts.heading, letterSpacing: -0.45 },
    featuredExcerpt: { fontSize: 14, color: c.subtext, lineHeight: 20 },
    articleCard: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    articleBody: { flex: 1, gap: 4 },
    articleTitle: { fontSize: 16, fontWeight: "600", color: c.text },
    readTime: { fontSize: 12, color: c.muted },
    excerpt: { fontSize: 14, color: c.subtext, lineHeight: 20 },
    readMore: { color: c.brandStrong, marginTop: 2 },
  });
