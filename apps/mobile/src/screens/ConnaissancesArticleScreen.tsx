import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card, EmptyState, Screen, ScreenHeader, colors } from "../components/ui";
import type { Block } from "../lib/knowledge";
import { knowledgeArticles } from "../lib/knowledge";
import type { ConnaissancesArticleProps } from "../navigation/types";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <Text style={styles.h2}>{block.text}</Text>;
    case "h3":
      return <Text style={styles.h3}>{block.text}</Text>;
    case "p":
      return <Text style={styles.p}>{block.text}</Text>;
    case "quote":
      return (
        <View style={styles.quote}>
          <Text style={styles.quoteText}>{block.text}</Text>
        </View>
      );
    case "ul":
      return (
        <View style={styles.list}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.li}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.liText}>{it}</Text>
            </View>
          ))}
        </View>
      );
    case "ol":
      return (
        <View style={styles.list}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.li}>
              <Text style={styles.bulletNum}>{i + 1}.</Text>
              <Text style={styles.liText}>{it}</Text>
            </View>
          ))}
        </View>
      );
    case "takeaways":
      return (
        <Card style={styles.takeaways}>
          <Text style={styles.takeawaysTitle}>⭐ {block.title}</Text>
          {block.items.map((it, i) => (
            <View key={i} style={styles.li}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.liText}>{it}</Text>
            </View>
          ))}
        </Card>
      );
    case "stats":
      return (
        <View style={styles.stats}>
          {block.items.map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      );
    case "comparison":
      return (
        <View style={styles.compRow}>
          <View style={[styles.compCol, styles.compHelps]}>
            <Text style={styles.compTitleHelps}>{block.helpsTitle}</Text>
            {block.helps.map((it, i) => (
              <Text key={i} style={styles.compItem}>
                ✓ {it}
              </Text>
            ))}
          </View>
          <View style={[styles.compCol, styles.compHurts]}>
            <Text style={styles.compTitleHurts}>{block.hurtsTitle}</Text>
            {block.hurts.map((it, i) => (
              <Text key={i} style={styles.compItem}>
                ✕ {it}
              </Text>
            ))}
          </View>
        </View>
      );
    case "callout":
      return (
        <View
          style={[
            styles.callout,
            block.variant === "encouragement"
              ? styles.calloutWarm
              : styles.calloutPhone,
          ]}
        >
          <Text style={styles.calloutTitle}>
            {block.variant === "phone" ? "📞 " : "💛 "}
            {block.title ?? (block.variant === "phone" ? "Ce que vous pouvez dire" : "")}
          </Text>
          <Text style={styles.calloutText}>{block.text}</Text>
        </View>
      );
    default:
      return null;
  }
}

export function ConnaissancesArticleScreen({
  navigation,
  route,
}: ConnaissancesArticleProps) {
  const { slug, title } = route.params;
  const article = knowledgeArticles.find((a) => a.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!article) {
    return (
      <Screen>
        <ScreenHeader title={title} onBack={() => navigation.goBack()} />
        <EmptyState title="Article introuvable" />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={article.title}
        subtitle={`${article.readTime} de lecture`}
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.excerpt}>{article.excerpt}</Text>

      {article.body.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}

      {article.faq.length > 0 ? (
        <View style={styles.faqWrap}>
          <Text style={styles.h2}>Questions fréquentes</Text>
          {article.faq.map((f, i) => (
            <Pressable
              key={i}
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <Card style={styles.faqCard}>
                <View style={styles.faqHead}>
                  <Text style={styles.faqQ}>{f.q}</Text>
                  <Text style={styles.faqChevron}>{openFaq === i ? "−" : "+"}</Text>
                </View>
                {openFaq === i ? <Text style={styles.faqA}>{f.a}</Text> : null}
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={styles.disclaimer}>
        Cet article est informatif et ne remplace pas l'avis d'un professionnel
        de santé.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  excerpt: {
    fontSize: 16,
    color: colors.subtext,
    fontStyle: "italic",
    lineHeight: 24,
  },
  h2: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 12 },
  h3: { fontSize: 17, fontWeight: "600", color: colors.text, marginTop: 6 },
  p: { fontSize: 16, color: colors.text, lineHeight: 24 },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  quoteText: { fontSize: 16, fontStyle: "italic", color: colors.subtext, lineHeight: 24 },
  list: { gap: 6 },
  li: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bullet: { fontSize: 16, color: colors.brand, lineHeight: 24 },
  bulletNum: { fontSize: 16, color: colors.brand, fontWeight: "600", lineHeight: 24, minWidth: 22 },
  check: { fontSize: 16, color: colors.success, lineHeight: 24 },
  liText: { flex: 1, fontSize: 16, color: colors.text, lineHeight: 24 },
  takeaways: { backgroundColor: "#e1efe5", borderColor: "#bcd9c5", gap: 8 },
  takeawaysTitle: { fontSize: 16, fontWeight: "700", color: "#1f5f66" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    flexGrow: 1,
    flexBasis: "30%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  statValue: { fontSize: 22, fontWeight: "700", color: colors.brand },
  statLabel: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 4 },
  compRow: { flexDirection: "row", gap: 10 },
  compCol: { flex: 1, borderRadius: 12, padding: 12, gap: 6 },
  compHelps: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  compHurts: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  compTitleHelps: { fontWeight: "700", color: "#15803d" },
  compTitleHurts: { fontWeight: "700", color: "#b91c1c" },
  compItem: { fontSize: 14, color: colors.text, lineHeight: 20 },
  callout: { borderRadius: 12, padding: 14, gap: 6 },
  calloutPhone: { backgroundColor: "#eef2ff", borderWidth: 1, borderColor: "#c7d2fe" },
  calloutWarm: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a" },
  calloutTitle: { fontSize: 13, fontWeight: "700", color: colors.action },
  calloutText: { fontSize: 15, color: colors.text, fontStyle: "italic", lineHeight: 22 },
  faqWrap: { gap: 10, marginTop: 8 },
  faqCard: { gap: 8 },
  faqHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQ: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
  faqChevron: { fontSize: 20, color: colors.muted, marginLeft: 8 },
  faqA: { fontSize: 15, color: colors.subtext, lineHeight: 22 },
  disclaimer: { fontSize: 12, color: colors.muted, fontStyle: "italic", marginTop: 12 },
});
