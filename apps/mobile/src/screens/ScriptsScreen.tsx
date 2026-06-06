import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import {
  Card,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { SCRIPT_ENTRIES } from "../hooks/use-scripts";
import type { ScriptsProps } from "../navigation/types";

export function ScriptsScreen({ navigation }: ScriptsProps) {
  return (
    <Screen scroll>
      <ScreenHeader
        title="Scripts"
        subtitle="Des phrases prêtes-à-l'emploi pour les situations qui épuisent."
        onBack={() => navigation.goBack()}
      />

      {/* Disclaimer */}
      <Card style={styles.info}>
        <Text style={styles.infoText}>
          Ces scripts sont des points de départ, pas des recettes. Adaptez-les
          à votre ton et à votre énergie du jour.
        </Text>
      </Card>

      {SCRIPT_ENTRIES.map((entry) => (
        <ScriptCard key={entry.id} entry={entry} />
      ))}
    </Screen>
  );
}

function ScriptCard({
  entry,
}: {
  entry: (typeof SCRIPT_ENTRIES)[number];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      {/* Header — always visible */}
      <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{entry.title}</Text>
          <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </View>
        <Text style={styles.whyHard}>{entry.whyHard}</Text>
      </Pressable>

      {expanded ? (
        <>
          {/* Principles */}
          <Section
            label="Principes"
            labelColor="#b45309"
            items={entry.principles}
            bullet="·"
          />

          {/* Phrases prêtes */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.success }]}>
              Phrases prêtes
            </Text>
            {entry.phrases.map((phrase) => (
              <PhraseRow key={phrase} phrase={phrase} />
            ))}
          </View>

          {/* Pitfalls */}
          <Section
            label="Pièges à éviter"
            labelColor={colors.danger}
            items={entry.pitfalls}
            bullet="✗"
          />
        </>
      ) : null}
    </Card>
  );
}

function Section({
  label,
  labelColor,
  items,
  bullet,
}: {
  label: string;
  labelColor: string;
  items: string[];
  bullet: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: labelColor }]}>{label}</Text>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: labelColor }]}>{bullet}</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function PhraseRow({ phrase }: { phrase: string }) {
  function handleShare() {
    Share.share({ message: phrase }).catch(() => {
      // Share cancelled or unavailable — silent.
    });
  }

  return (
    <Pressable onPress={handleShare} style={styles.phraseRow}>
      <Text style={styles.phraseText}>{phrase}</Text>
      <Text style={styles.shareHint}>Partager</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  info: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 22,
  },
  chevron: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  whyHard: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginTop: 2,
  },
  section: {
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    width: 14,
    textAlign: "center",
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 20,
  },
  phraseRow: {
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  phraseText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  shareHint: {
    fontSize: 11,
    color: colors.action,
    fontWeight: "500",
  },
});
