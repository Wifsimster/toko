import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Loader, Screen, ScreenHeader, fonts } from "../components/ui";
import { timer as copy } from "../lib/copy";
import { CRITTER_CATALOG } from "../lib/critters";
import { useTheme, type Palette } from "../lib/theme";
import { useCompanions } from "../hooks/use-companions";
import type { CompanionCollectionProps } from "../navigation/types";

// The child's critter collection: every catalog animal, discovered ones in
// colour, the rest as a muted "à découvrir" silhouette. Mirrors the PWA
// CompanionCollection — a gentle, no-pressure reward mirror.
export function CompanionCollectionScreen({
  navigation,
  route,
}: CompanionCollectionProps) {
  const { childId, childName } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const { data, isLoading } = useCompanions(childId);
  const counts = useMemo(
    () => new Map((data ?? []).map((d) => [d.animalId, d.count ?? 1])),
    [data],
  );

  return (
    <Screen scroll>
      <ScreenHeader
        title={copy.collectionTitle}
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Text style={styles.intro}>{copy.collectionIntro(counts.size)}</Text>
          <View style={styles.grid}>
            {CRITTER_CATALOG.map((cr) => {
              const count = counts.get(cr.id) ?? 0;
              const found = count > 0;
              return (
                <View
                  key={cr.id}
                  style={[styles.cell, found ? styles.cellFound : styles.cellLocked]}
                >
                  <Text style={[styles.emoji, !found && styles.emojiLocked]}>
                    {found ? cr.emoji : "❔"}
                  </Text>
                  <Text style={[styles.name, !found && styles.nameLocked]}>
                    {found ? cr.name : copy.collectionLocked}
                  </Text>
                  {found ? (
                    <Text style={styles.count}>
                      {count > 1 ? `rencontré ${count} fois` : "rencontré 1 fois"}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: { fontSize: 14, color: c.muted, fontFamily: fonts.body, lineHeight: 20 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
    cell: {
      width: "47%",
      flexGrow: 1,
      borderRadius: 14,
      borderWidth: 1,
      paddingVertical: 20,
      alignItems: "center",
      gap: 8,
    },
    cellFound: { backgroundColor: c.card, borderColor: c.brand },
    cellLocked: { backgroundColor: c.bg, borderColor: c.border, borderStyle: "dashed" },
    emoji: { fontSize: 44 },
    emojiLocked: { opacity: 0.4 },
    name: { fontSize: 14, color: c.text, fontFamily: fonts.semibold },
    nameLocked: { color: c.muted, fontFamily: fonts.medium },
    count: { fontSize: 12, color: c.muted, fontFamily: fonts.medium },
  });
