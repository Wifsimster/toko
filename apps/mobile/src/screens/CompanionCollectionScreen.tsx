import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COMPANION_TILE, Companion } from "../components/mo/companion";
import { Loader, Screen, ScreenHeader, fonts } from "../components/ui";
import { timer as copy } from "../lib/copy";
import { CRITTER_CATALOG } from "../lib/critters";
import { useTheme, type Palette } from "../lib/theme";
import { useCompanions } from "../hooks/use-companions";
import type { CompanionCollectionProps } from "../navigation/types";

// The child's critter collection: every catalog animal, discovered ones
// drawn in colour, the rest as their sand silhouette with a « ? » (the child
// guesses who will come without seeing it). Mirrors the PWA
// CompanionCollection — a gentle, no-pressure reward mirror. Drawings stay
// on a cream disc in both themes (they have no dark version).
const TILE_ART = 64;
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
                  accessible
                  accessibilityLabel={
                    found ? copy.collectionFoundLabel(cr.name, count) : copy.collectionLockedLabel
                  }
                >
                  <View style={[styles.disc, found ? styles.discFound : styles.discLocked]}>
                    <Companion id={cr.id} variant={found ? "small" : "locked"} size={TILE_ART} />
                  </View>
                  <Text style={[styles.name, !found && styles.nameLocked]}>
                    {found ? cr.name : copy.collectionLocked}
                  </Text>
                  {found ? <Text style={styles.count}>{copy.collectionMet(count)}</Text> : null}
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
    disc: {
      width: TILE_ART + 16,
      height: TILE_ART + 16,
      borderRadius: (TILE_ART + 16) / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    discFound: { backgroundColor: COMPANION_TILE.found },
    discLocked: {
      backgroundColor: COMPANION_TILE.locked,
      borderWidth: 2,
      borderColor: COMPANION_TILE.lockedBorder,
    },
    name: { fontSize: 14, color: c.text, fontFamily: fonts.semibold },
    nameLocked: { color: c.muted, fontFamily: fonts.medium },
    count: { fontSize: 12, color: c.muted, fontFamily: fonts.medium },
  });
