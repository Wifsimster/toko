import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import {
  BEHAVIOR_ENTRIES,
  filterEntries,
} from "../hooks/use-decodeur";
import type { DecodeurProps } from "../navigation/types";

export function DecodeurScreen({ navigation }: DecodeurProps) {
  const [query, setQuery] = useState("");
  const matches = filterEntries(BEHAVIOR_ENTRIES, query);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Décodeur"
        subtitle="Vous observez un comportement qui vous épuise ? Cherchez-le ici."
        onBack={() => navigation.goBack()}
      />

      {/* Disclaimer */}
      <Card style={styles.info}>
        <Text style={styles.infoText}>
          Outil pédagogique — ne remplace pas un avis professionnel. Chaque
          enfant reste unique.
        </Text>
      </Card>

      {/* Search */}
      <TextInput
        style={styles.input}
        placeholder="Ex : il jette ses affaires, il s'agite…"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {/* Results */}
      {matches.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          body="Essayez un mot-clé plus simple (« devoirs », « écran », « matin »)."
        />
      ) : (
        matches.map((entry) => (
          <Card key={entry.id}>
            {/* Behaviour */}
            <Text style={styles.behavior}>{entry.behavior}</Text>

            {/* Explanation */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Ce qui se passe dans son cerveau</Text>
              <Text style={styles.sectionBody}>{entry.explanation}</Text>
            </View>

            {/* Tip */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, styles.tipLabel]}>
                Ce qui peut aider
              </Text>
              <Text style={styles.sectionBody}>{entry.tip}</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#fff",
  },
  behavior: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 22,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b45309",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipLabel: {
    color: colors.success,
  },
  sectionBody: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
});
