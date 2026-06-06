import type { Symptom } from "@focusflow/validators";
import { StyleSheet, Text, View } from "react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { useSymptoms } from "../hooks/use-symptoms";
import { useActiveChild } from "../lib/active-child";
import type { SymptomsProps } from "../navigation/types";

// The 5 numeric dimensions from the Symptom schema (routinesOk is boolean, handled separately)
const DIMENSIONS: { key: keyof Symptom; label: string; highIsBad: boolean }[] =
  [
    { key: "mood", label: "Humeur", highIsBad: false },
    { key: "focus", label: "Concentration", highIsBad: false },
    { key: "sleep", label: "Sommeil", highIsBad: false },
    { key: "agitation", label: "Agitation", highIsBad: true },
    { key: "impulse", label: "Impulsivité", highIsBad: true },
  ];

function scoreColor(value: number, highIsBad: boolean): string {
  const bad = highIsBad ? value >= 7 : value <= 3;
  const good = highIsBad ? value <= 3 : value >= 7;
  if (bad) return colors.danger;
  if (good) return colors.success;
  return colors.muted;
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
  const color = scoreColor(value, highIsBad);
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

export function SymptomsScreen({ route }: SymptomsProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";
  const { isLoading, isError, data } = useSymptoms(childId);

  // Most recent first
  const sorted = data
    ? [...data].sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <Screen scroll>
      <ScreenHeader
        title="Symptômes"
        subtitle={childName}
        onBack={undefined}
      />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorNote message="Impossible de charger l'historique. Vérifiez votre connexion." />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Aucune observation"
          body="Les observations enregistrées via le formulaire de suivi apparaîtront ici."
        />
      ) : (
        sorted.map((s) => <SymptomCard key={s.id} symptom={s} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  badge: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  badgeGood: {
    backgroundColor: "#dcfce7",
    color: colors.success,
  },
  badgeBad: {
    backgroundColor: "#fee2e2",
    color: colors.danger,
  },
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dimLabel: {
    width: 110,
    fontSize: 13,
    color: colors.subtext,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
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
    fontWeight: "600",
    textAlign: "right",
  },
  notes: {
    fontSize: 13,
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 2,
  },
});
