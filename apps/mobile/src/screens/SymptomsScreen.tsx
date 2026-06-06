import { useMemo } from "react";
import type { Symptom } from "@focusflow/validators";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  FAB,
  FilterChips,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import { useSymptoms } from "../hooks/use-symptoms";
import { useActiveChild } from "../lib/active-child";
import type { SymptomsProps } from "../navigation/types";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "agitation", label: "Agitation élevée" },
  { key: "impulse", label: "Impulsivité élevée" },
  { key: "mood", label: "Humeur difficile" },
  { key: "sleep", label: "Sommeil perturbé" },
];

function matchesFilter(s: Symptom, key: string): boolean {
  switch (key) {
    case "agitation":
      return s.agitation >= 7;
    case "impulse":
      return s.impulse >= 7;
    case "mood":
      return s.mood <= 3;
    case "sleep":
      return s.sleep <= 3;
    default:
      return true;
  }
}

// The 5 numeric dimensions from the Symptom schema (routinesOk is boolean, handled separately)
const DIMENSIONS: { key: keyof Symptom; label: string; highIsBad: boolean }[] =
  [
    { key: "mood", label: "Humeur", highIsBad: false },
    { key: "focus", label: "Concentration", highIsBad: false },
    { key: "sleep", label: "Sommeil", highIsBad: false },
    { key: "agitation", label: "Agitation", highIsBad: true },
    { key: "impulse", label: "Impulsivité", highIsBad: true },
  ];

function scoreColor(value: number, highIsBad: boolean, c: Palette): string {
  const bad = highIsBad ? value >= 7 : value <= 3;
  const good = highIsBad ? value <= 3 : value >= 7;
  if (bad) return c.danger;
  if (good) return c.success;
  return c.muted;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function DimensionRow({
  label,
  value,
  highIsBad,
}: {
  label: string;
  value: number;
  highIsBad: boolean;
}) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const color = scoreColor(value, highIsBad, c);
  const barWidth = `${value * 10}%` as `${number}%`;
  return (
    <View style={styles.dimRow}>
      <Text style={styles.dimLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <Text style={[styles.dimValue, { color }]}>{value}</Text>
    </View>
  );
}

function SymptomCard({ symptom }: { symptom: Symptom }) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Card>
      <View style={styles.cardHead}>
        <Text style={styles.dateText}>{formatDate(symptom.date)}</Text>
        {symptom.routinesOk !== undefined ? (
          <Text style={[styles.badge, symptom.routinesOk ? styles.badgeGood : styles.badgeBad]}>
            {symptom.routinesOk ? "Routines ✓" : "Routines ✗"}
          </Text>
        ) : null}
      </View>
      {DIMENSIONS.map((d) => {
        const raw = symptom[d.key];
        if (typeof raw !== "number") return null;
        return (
          <DimensionRow
            key={d.key}
            label={d.label}
            value={raw}
            highIsBad={d.highIsBad}
          />
        );
      })}
      {symptom.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {symptom.notes}
        </Text>
      ) : null}
    </Card>
  );
}

export function SymptomsScreen({ navigation, route }: SymptomsProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";
  const { isLoading, isError, data } = useSymptoms(childId);
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [filter, setFilter] = useState("all");
  // Most recent first, then category filter
  const sorted = data
    ? [...data].sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const shown = sorted.filter((s) => matchesFilter(s, filter));

  return (
    <Screen
      scroll
      fab={
        <FAB
          icon={<Plus size={26} color="#fff" />}
          label="Ajouter une observation"
          onPress={() =>
            navigation.navigate("Checkin", { childId, childName })
          }
        />
      }
    >
      <ScreenHeader title="Symptômes" subtitle={childName} onBack={undefined} />

      {sorted.length > 0 ? (
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      ) : null}

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorNote message="Impossible de charger l'historique. Vérifiez votre connexion." />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Aucune observation"
          body="Les observations enregistrées via le formulaire de suivi apparaîtront ici."
        />
      ) : shown.length === 0 ? (
        <EmptyState title="Aucune observation pour ce filtre" />
      ) : (
        shown.map((s) => <SymptomCard key={s.id} symptom={s} />)
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    cardHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateText: {
      fontSize: 16,
      fontFamily: fonts.semibold,
      color: c.text,
    },
    badge: {
      fontSize: 12,
      fontFamily: fonts.medium,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      overflow: "hidden",
    },
    badgeGood: {
      backgroundColor: c.successSurface,
      color: c.success,
    },
    badgeBad: {
      backgroundColor: c.alertSurface,
      color: c.danger,
    },
    dimRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dimLabel: {
      width: 110,
      fontSize: 13,
      fontFamily: fonts.body,
      color: c.subtext,
    },
    barTrack: {
      flex: 1,
      height: 6,
      backgroundColor: c.border,
      borderRadius: 999,
      overflow: "hidden",
    },
    barFill: {
      height: 6,
      borderRadius: 999,
    },
    dimValue: {
      width: 20,
      fontSize: 13,
      fontFamily: fonts.semibold,
      textAlign: "right",
    },
    notes: {
      fontSize: 13,
      color: c.muted,
      fontFamily: fonts.body,
      fontStyle: "italic",
      marginTop: 2,
    },
  });
