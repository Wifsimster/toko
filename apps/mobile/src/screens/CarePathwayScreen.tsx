import type { CareStepStatus } from "@focusflow/validators";
import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalLink } from "lucide-react-native";

import {
  Card,
  EmptyState,
  ErrorNote,
  Loader,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import {
  useCarePathwayProgress,
  useUpsertCarePathwayStep,
} from "../hooks/use-care-pathway";
import type { CarePathwayProps } from "../navigation/types";

// ─── Static step catalogue (stable IDs — must match DB stepId values) ────────
type Phase = "screening" | "diagnosis" | "support";

interface Step {
  id: string;
  phase: Phase;
  emoji: string;
  title: string;
  description: string;
  externalLink?: { href: string; label: string };
}

const STEPS: Step[] = [
  // Phase 1 — Repérage
  {
    id: "school_signal",
    phase: "screening",
    emoji: "🏫",
    title: "Signal scolaire",
    description: "L'enseignant ou le directeur a signalé des difficultés.",
  },
  {
    id: "gp_consultation",
    phase: "screening",
    emoji: "🩺",
    title: "Consultation médecin",
    description: "Premier rendez-vous avec le médecin généraliste ou pédiatre.",
  },
  {
    id: "ent_audition",
    phase: "screening",
    emoji: "👂",
    title: "Bilan auditif (ORL)",
    description: "Vérification de l'audition pour écarter une cause ORL.",
  },
  {
    id: "ophtalmo_vision",
    phase: "screening",
    emoji: "👁️",
    title: "Bilan visuel",
    description: "Consultation ophtalmologique pour écarter une cause visuelle.",
  },
  {
    id: "sleep_study",
    phase: "screening",
    emoji: "🌙",
    title: "Bilan du sommeil",
    description: "Évaluation des troubles du sommeil pouvant mimer le TDAH.",
    externalLink: {
      href: "https://www.has-sante.fr/jcms/c_2025618",
      label: "Recommandation HAS",
    },
  },
  {
    id: "speech_therapy_assessment",
    phase: "screening",
    emoji: "💬",
    title: "Bilan orthophonique",
    description: "Évaluation du langage oral et écrit.",
  },
  {
    id: "psychomotor_assessment",
    phase: "screening",
    emoji: "🤸",
    title: "Bilan psychomoteur",
    description: "Évaluation de la coordination et de la motricité.",
  },

  // Phase 2 — Diagnostic
  {
    id: "neuropsy_assessment",
    phase: "diagnosis",
    emoji: "🧠",
    title: "Bilan neuropsychologique",
    description: "Tests cognitifs et comportementaux réalisés par un psychologue spécialisé.",
  },
  {
    id: "specialist_consultation",
    phase: "diagnosis",
    emoji: "👨‍⚕️",
    title: "Consultation spécialiste",
    description: "Rendez-vous avec neuropédiatre ou pédopsychiatre.",
  },
  {
    id: "diagnosis_announcement",
    phase: "diagnosis",
    emoji: "📋",
    title: "Annonce du diagnostic",
    description: "Le médecin confirme (ou non) le TDAH et explique le diagnostic.",
  },
  {
    id: "second_opinion",
    phase: "diagnosis",
    emoji: "🤝",
    title: "Deuxième avis",
    description: "Consultation d'un second spécialiste si vous avez des doutes.",
  },

  // Phase 3 — Soutien
  {
    id: "mdph_application",
    phase: "support",
    emoji: "📝",
    title: "Dossier MDPH",
    description: "Dépôt du dossier auprès de la Maison Départementale des Personnes Handicapées.",
    externalLink: { href: "https://www.mdph.fr/", label: "Trouver ma MDPH" },
  },
  {
    id: "aeeh_request",
    phase: "support",
    emoji: "💶",
    title: "Demande AEEH",
    description: "Allocation d'Éducation de l'Enfant Handicapé auprès de la CAF.",
    externalLink: {
      href: "https://www.service-public.fr/particuliers/vosdroits/F14809",
      label: "Voir sur service-public.fr",
    },
  },
  {
    id: "pch_request",
    phase: "support",
    emoji: "🛟",
    title: "Demande PCH",
    description: "Prestation de Compensation du Handicap si éligible.",
    externalLink: {
      href: "https://www.service-public.fr/particuliers/vosdroits/F14202",
      label: "Voir sur service-public.fr",
    },
  },
  {
    id: "school_pap_pps",
    phase: "support",
    emoji: "🎒",
    title: "PAP / PPS scolaire",
    description: "Plan d'Accompagnement Personnalisé ou Projet Personnalisé de Scolarisation.",
  },
  {
    id: "occupational_therapy",
    phase: "support",
    emoji: "✋",
    title: "Ergothérapie",
    description: "Suivi en ergothérapie pour les difficultés pratiques du quotidien.",
  },
  {
    id: "ongoing_followup",
    phase: "support",
    emoji: "🔄",
    title: "Suivi régulier",
    description: "Rendez-vous de suivi pluridisciplinaire au fil du temps.",
  },
];

const PHASES: { id: Phase; label: string; emoji: string }[] = [
  { id: "screening", label: "Repérage", emoji: "🔍" },
  { id: "diagnosis", label: "Diagnostic", emoji: "🩺" },
  { id: "support", label: "Soutien", emoji: "🤝" },
];

const stepsByPhase = (phase: Phase) => STEPS.filter((s) => s.phase === phase);

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_LABELS: Record<CareStepStatus, string> = {
  todo: "À faire",
  doing: "En cours",
  done: "Fait ✓",
};

function statusColor(status: CareStepStatus, c: Palette): string {
  if (status === "done") return c.success;
  if (status === "doing") return c.action;
  return c.muted;
}

function nextStatus(current: CareStepStatus): CareStepStatus {
  if (current === "todo") return "doing";
  if (current === "doing") return "done";
  return "todo";
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({
  step,
  status,
  onToggle,
  isPending,
  styles,
  palette,
}: {
  step: Step;
  status: CareStepStatus;
  onToggle: () => void;
  isPending: boolean;
  styles: ReturnType<typeof makeStyles>;
  palette: Palette;
}) {
  const color = statusColor(status, palette);
  return (
    <Card style={status === "done" ? styles.cardDone : undefined}>
      <View style={styles.stepRow}>
        <Text style={styles.stepEmoji}>{step.emoji}</Text>
        <View style={styles.stepBody}>
          <Text style={[styles.stepTitle, status === "done" && styles.stepTitleDone]}>
            {step.title}
          </Text>
          <Text style={styles.stepDesc}>{step.description}</Text>
        </View>
      </View>
      <Pressable
        onPress={onToggle}
        disabled={isPending}
        hitSlop={8}
        style={[styles.statusBtn, { borderColor: color }]}
      >
        <Text style={[styles.statusLabel, { color }]}>
          {STATUS_LABELS[status]}
        </Text>
        <Text style={[styles.statusHint, { color }]}>
          → {STATUS_LABELS[nextStatus(status)]}
        </Text>
      </Pressable>
      {step.externalLink ? (
        <Pressable
          onPress={() => Linking.openURL(step.externalLink!.href)}
          style={styles.linkRow}
          accessibilityRole="link"
          accessibilityLabel={step.externalLink.label}
        >
          <ExternalLink size={15} color={palette.action} />
          <Text style={styles.linkText}>{step.externalLink.label}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function CarePathwayScreen({ navigation, route }: CarePathwayProps) {
  const { childId, childName } = route.params;
  const list = useCarePathwayProgress(childId);
  const upsert = useUpsertCarePathwayStep(childId);

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const progressMap = new Map<string, CareStepStatus>(
    (list.data ?? []).map((p) => [p.stepId, p.status as CareStepStatus]),
  );

  const completedCount = STEPS.filter(
    (s) => progressMap.get(s.id) === "done",
  ).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  function toggle(stepId: string) {
    const current = progressMap.get(stepId) ?? "todo";
    upsert.mutate({ childId, stepId, status: nextStatus(current) });
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Parcours de soin"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* Progress summary */}
      <Card>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {completedCount} / {STEPS.length} étapes terminées
          </Text>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
        </View>
        <Text style={styles.disclaimer}>
          Ce parcours est indicatif — chaque enfant est différent.
        </Text>
      </Card>

      {upsert.isError ? (
        <ErrorNote message="Impossible de mettre à jour cette étape. Réessayez." />
      ) : null}

      {list.isLoading ? (
        <Loader />
      ) : list.isError ? (
        <EmptyState
          title="Impossible de charger le parcours"
          body="Vérifiez votre connexion et réessayez."
        />
      ) : (
        PHASES.map((phase) => (
          <View key={phase.id} style={styles.phase}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseEmoji}>{phase.emoji}</Text>
              <Text style={styles.phaseLabel}>{phase.label}</Text>
            </View>
            {stepsByPhase(phase.id).map((step) => {
              const status = progressMap.get(step.id) ?? "todo";
              return (
                <StepCard
                  key={step.id}
                  step={step}
                  status={status}
                  onToggle={() => toggle(step.id)}
                  isPending={upsert.isPending}
                  styles={styles}
                  palette={c}
                />
              );
            })}
          </View>
        ))
      )}
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: { fontSize: 15, fontWeight: "600", color: c.text },
    progressPct: { fontSize: 22, fontWeight: "700", color: c.brand },
    progressTrack: {
      height: 8,
      backgroundColor: c.border,
      borderRadius: 999,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: c.brand,
      borderRadius: 999,
    },
    disclaimer: { fontSize: 12, color: c.muted },
    phase: { gap: 10 },
    phaseHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 4,
    },
    phaseEmoji: { fontSize: 20 },
    phaseLabel: { fontSize: 17, fontWeight: "700", color: c.text },
    stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    stepEmoji: { fontSize: 24, lineHeight: 28 },
    stepBody: { flex: 1 },
    stepTitle: { fontSize: 15, fontWeight: "600", color: c.text },
    stepTitleDone: { color: c.success },
    stepDesc: { fontSize: 13, color: c.subtext, lineHeight: 18, marginTop: 2 },
    cardDone: { borderColor: c.success, opacity: 0.9 },
    statusBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 4,
    },
    statusLabel: { fontSize: 13, fontWeight: "600" },
    statusHint: { fontSize: 12, opacity: 0.7 },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      marginTop: 2,
    },
    linkText: { fontSize: 14, color: c.action, fontFamily: fonts.semibold },
  });
