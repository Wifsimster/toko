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
import { useActivity, type AuditEntry, type AuditEntityType } from "../hooks/use-activity";
import type { ActivityProps } from "../navigation/types";

// ─── Emoji per entity type — avoids importing Lucide icons ───────────────────

const ENTITY_EMOJI: Record<AuditEntityType, string> = {
  child: "👶",
  symptom: "📊",
  journal: "📖",
  medication: "💊",
  medication_log: "💊",
  crisis_item: "🤝",
  child_access: "🔒",
  child_invitation: "✉️",
  strength: "✨",
  routine: "📋",
  routine_completion: "✅",
  admin_document: "📄",
};

// ─── Relative time formatter (FR, no external dep) ───────────────────────────

function formatRelativeFr(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const d = Math.floor(hr / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Single activity row ──────────────────────────────────────────────────────

function ActivityRow({ entry }: { entry: AuditEntry }) {
  const emoji = ENTITY_EMOJI[entry.entityType] ?? "🔔";
  const actor = entry.actorName ?? "Quelqu'un";
  const text = entry.summary ?? `${entry.entityType} — ${entry.action}`;
  const relative = formatRelativeFr(new Date(entry.createdAt));

  return (
    <Card style={styles.row}>
      <View style={styles.rowInner}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.rowBody}>
          <Text style={styles.rowText} numberOfLines={2}>
            <Text style={styles.actor}>{actor} </Text>
            <Text style={styles.summary}>{text}</Text>
          </Text>
          <Text style={styles.time}>{relative}</Text>
        </View>
      </View>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ActivityScreen({ navigation, route }: ActivityProps) {
  const { childId, childName } = route.params;
  const { data, isLoading, isError } = useActivity(childId, 100);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Activité récente"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {isError ? (
        <ErrorNote message="Impossible de charger l'activité. Vérifiez votre connexion." />
      ) : isLoading ? (
        <Loader />
      ) : data && data.length > 0 ? (
        data.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
      ) : (
        <EmptyState
          title="Aucune activité"
          body="Les actions enregistrées dans Tokō apparaîtront ici."
        />
      )}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    // Card already has padding + gap; we just tweak internals
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actor: {
    fontWeight: "600",
    color: colors.text,
  },
  summary: {
    color: colors.subtext,
  },
  time: {
    fontSize: 12,
    color: colors.muted,
  },
});
