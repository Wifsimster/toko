import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  LEXIQUE_CATEGORIES,
  filterLexique,
  groupLexiqueByCategory,
  type LexiqueCategoryId,
} from "@focusflow/validators";

import { Button, Card, FilterChips, Screen, ScreenHeader, SearchBar, fonts } from "../components/ui";
import { lexicon as copy } from "../lib/copy";
import { knowledgeArticles } from "../lib/knowledge";
import { useTheme, type Palette } from "../lib/theme";
import { backIfPushed } from "../navigation/tabs";
import type { LexiqueProps } from "../navigation/types";

const FILTERS = [
  { key: "all", label: copy.all },
  ...LEXIQUE_CATEGORIES.map((cat) => ({ key: cat.id, label: cat.shortLabel })),
];

const ARTICLE_TITLES = new Map(knowledgeArticles.map((a) => [a.slug, a.title]));

export function LexiqueScreen({ navigation }: LexiqueProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LexiqueCategoryId | "all">("all");

  const results = useMemo(() => filterLexique(query, category), [query, category]);
  const sections = useMemo(() => groupLexiqueByCategory(results), [results]);

  return (
    <Screen scroll>
      <ScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={backIfPushed(navigation)} />
      <SearchBar value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} label={copy.searchLabel} />
      <FilterChips
        options={FILTERS}
        value={category}
        onChange={(key) => setCategory(key as LexiqueCategoryId | "all")}
      />
      <Text accessibilityLiveRegion="polite" style={styles.count}>
        {results.length === 0 ? copy.none : copy.count(results.length)}
      </Text>

      {results.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyText}>{copy.emptyBody}</Text>
          <Button
            label={copy.reset}
            variant="secondary"
            onPress={() => {
              setQuery("");
              setCategory("all");
            }}
          />
        </Card>
      ) : (
        sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {section.label}
            </Text>
            {section.entries.map((entry) => {
              const articleTitle = entry.relatedSlug ? ARTICLE_TITLES.get(entry.relatedSlug) : undefined;
              return (
                <Card key={entry.term} style={styles.entry}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{entry.term}</Text>
                  </View>
                  {entry.label ? <Text style={styles.label}>{entry.label}</Text> : null}
                  <Text style={styles.definition}>{entry.definition}</Text>
                  {entry.relatedSlug && articleTitle ? (
                    <Pressable
                      onPress={() =>
                        navigation.navigate("ConnaissancesArticle", { slug: entry.relatedSlug!, title: articleTitle })
                      }
                      accessibilityRole="link"
                      accessibilityLabel={`${copy.learnMore} : ${articleTitle}`}
                      style={styles.more}
                    >
                      <Text style={styles.moreText}>{copy.learnMore} ›</Text>
                    </Pressable>
                  ) : null}
                </Card>
              );
            })}
          </View>
        ))
      )}

      <Text style={styles.disclaimer}>{copy.disclaimer}</Text>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    count: { fontFamily: fonts.body, fontSize: 14, color: c.muted },
    empty: { gap: 14, borderStyle: "dashed", alignItems: "center" },
    emptyText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.muted, textAlign: "center" },
    section: { gap: 10, marginTop: 8 },
    sectionTitle: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: c.text },
    entry: { gap: 8 },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: c.secondary,
    },
    badgeText: { fontFamily: fonts.semibold, fontSize: 14, color: c.brandStrong },
    label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: c.text },
    definition: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: c.muted },
    more: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
    moreText: { fontFamily: fonts.medium, fontSize: 14, color: c.brandStrong },
    disclaimer: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: c.muted, marginTop: 16 },
  });
