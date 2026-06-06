import { StyleSheet, Text } from "react-native";

import {
  ErrorNote,
  Loader,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { useNewsArticle } from "../hooks/use-news";
import type { ConnaissancesArticleProps } from "../navigation/types";

/**
 * Strip HTML tags and decode the most common HTML entities so that
 * articles stored as HTML render as readable plain text without any
 * markdown/HTML library.
 */
function stripHtml(html: string): string {
  return html
    // Remove script / style blocks including their content
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Replace block-level closing tags with newlines for readability
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, "\n")
    // Replace <br> variants with newlines
    .replace(/<br\s*\/?>/gi, "\n")
    // Replace list item / heading openings with a dash or space
    .replace(/<(li)[^>]*>/gi, "• ")
    // Strip remaining tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    // Collapse excessive blank lines (3+ → 2)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ConnaissancesArticleScreen({
  navigation,
  route,
}: ConnaissancesArticleProps) {
  const { slug, title } = route.params;
  const query = useNewsArticle(slug);

  return (
    <Screen scroll>
      <ScreenHeader
        title={title}
        onBack={() => navigation.goBack()}
      />

      {query.isLoading ? (
        <Loader />
      ) : query.isError ? (
        <ErrorNote message="Impossible de charger l'article. Réessayez." />
      ) : query.data ? (
        <>
          {query.data.excerpt ? (
            <Text style={styles.excerpt}>{query.data.excerpt}</Text>
          ) : null}
          <Text style={styles.body}>{stripHtml(query.data.content)}</Text>
          {query.data.publishedAt ? (
            <Text style={styles.meta}>
              Publié le{" "}
              {new Date(query.data.publishedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  excerpt: {
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
    fontStyle: "italic",
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    paddingLeft: 12,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
  },
});
