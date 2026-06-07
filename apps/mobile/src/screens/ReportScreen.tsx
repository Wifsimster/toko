import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  CalloutCard,
  Card,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import { useSendReportEmail, type ReportPeriod } from "../hooks/use-report";
import { useInsights } from "../hooks/use-insights";
import { useJournal } from "../hooks/use-journal";
import { usePremium } from "../hooks/use-billing";
import { SYMPTOM_DIMENSIONS } from "../lib/copy";
import { WEB_URL } from "../lib/config";
import type { ReportProps } from "../navigation/types";

const PERIOD_DAYS: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

function sinceISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

// ─── Period pills ─────────────────────────────────────────────────────────────

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "week", label: "7 jours" },
  { value: "month", label: "30 jours" },
  { value: "quarter", label: "3 mois" },
];

function Kpi({
  value,
  label,
  styles,
}: {
  value: string;
  label: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ReportScreen({ navigation, route }: ReportProps) {
  const { childId, childName } = route.params;
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [period, setPeriod] = useState<ReportPeriod>("quarter");
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState("");
  const [sent, setSent] = useState(false);

  const sendEmail = useSendReportEmail();
  const insights = useInsights(childId, period);
  const journal = useJournal(childId);
  const { isPremium } = usePremium();

  // On-screen preview (assembled from data the app already fetches — there is
  // no dedicated report endpoint; the server builds the emailed/PDF report).
  const symptoms = insights.data?.symptoms ?? [];
  const obsCount = symptoms.length;
  const averages = SYMPTOM_DIMENSIONS.map((d) => ({
    label: d.label,
    value: avg(symptoms.map((s) => s[d.key as keyof typeof s] as number)),
  }));
  const since = sinceISO(PERIOD_DAYS[period]);
  const periodEntries = (journal.data ?? []).filter((e) => e.date >= since);
  const crisisCount = periodEntries.filter((e) => e.tags.includes("crisis")).length;
  const victoryCount = periodEntries.filter((e) => e.tags.includes("victory")).length;

  function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    sendEmail.mutate(
      {
        childId,
        recipientEmail: trimmed,
        period,
        questions: questions.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSent(true);
          setEmail("");
        },
      },
    );
  }

  function handleOpenWeb() {
    WebBrowser.openBrowserAsync(`${WEB_URL}/rapport`);
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Carnet de consultation"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {/* Explanation */}
      <Card>
        <Text style={styles.infoTitle}>À quoi ça sert ?</Text>
        <Text style={styles.infoBody}>
          Le carnet rassemble les données de suivi de {childName} — symptômes,
          journal, traitements, programme Barkley — dans un rapport lisible par
          un médecin ou un spécialiste.
        </Text>
      </Card>

      {/* Period selector */}
      <Card>
        <Text style={styles.sectionLabel}>Période du rapport</Text>
        <View style={styles.pills}>
          {PERIODS.map((p) => {
            const on = p.value === period;
            return (
              <Pressable
                key={p.value}
                onPress={() => setPeriod(p.value)}
                style={[styles.pill, on && styles.pillOn]}
              >
                <Text style={[styles.pillText, on && styles.pillTextOn]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Preview */}
      <Card>
        <Text style={styles.sectionLabel}>Aperçu</Text>
        {insights.isLoading ? (
          <Loader />
        ) : (
          <>
            <View style={styles.kpiRow}>
              <Kpi value={String(obsCount)} label="observations" styles={styles} />
              <Kpi value={String(crisisCount)} label="crises" styles={styles} />
              <Kpi value={String(victoryCount)} label="victoires" styles={styles} />
            </View>
            {averages.some((a) => a.value !== null) ? (
              <View style={styles.avgBlock}>
                <Text style={styles.avgTitle}>Moyennes (sur 10)</Text>
                {averages.map((a) => (
                  <View key={a.label} style={styles.avgRow}>
                    <Text style={styles.avgLabel}>{a.label}</Text>
                    <Text style={styles.avgValue}>
                      {a.value !== null ? a.value : "—"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.hint}>
                Pas encore d'observations sur cette période.
              </Text>
            )}
          </>
        )}
      </Card>

      {/* Premium upsell (server enforces too) */}
      {!isPremium ? (
        <CalloutCard variant="tip" label="Plan Famille">
          <Text style={styles.infoBody}>
            L'envoi du carnet par e-mail est réservé au plan Famille.
          </Text>
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/abonnement`)}
            accessibilityRole="button"
          >
            <Text style={styles.upsellLink}>Découvrir le plan Famille ›</Text>
          </Pressable>
        </CalloutCard>
      ) : null}

      {/* Send by email */}
      <Card>
        <Text style={styles.sectionLabel}>Recevoir par e-mail</Text>
        <Text style={styles.hint}>
          Entrez l'adresse e-mail du destinataire (médecin, orthophoniste,
          vous-même…). Le rapport sera envoyé depuis Tokō.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✓ Rapport envoyé ! Vérifiez la boîte e-mail.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="adresse@exemple.fr"
              placeholderTextColor={c.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, styles.questionsInput]}
              placeholder="Questions pour le médecin (optionnel)"
              placeholderTextColor={c.muted}
              value={questions}
              onChangeText={setQuestions}
              multiline
            />
            {sendEmail.isError ? (
              <ErrorNote
                message={
                  sendEmail.error instanceof Error &&
                  sendEmail.error.message.includes("PLAN_REQUIRED")
                    ? "Cette fonctionnalité est réservée au plan Famille. Ouvrez le rapport sur le site pour y accéder."
                    : "L'envoi a échoué. Réessayez ou ouvrez le rapport sur le site."
                }
              />
            ) : null}
            <PrimaryButton
              label="Recevoir le rapport par e-mail"
              onPress={handleSend}
              loading={sendEmail.isPending}
              disabled={!email.trim()}
            />
          </>
        )}
      </Card>

      {/* Open on web — always available, prominent secondary path */}
      <Card style={styles.webCard}>
        <Text style={styles.webCardTitle}>Ouvrir sur le site Tokō</Text>
        <Text style={styles.hint}>
          Consultez, personnalisez et téléchargez le rapport directement depuis
          votre navigateur.
        </Text>
        <Pressable onPress={handleOpenWeb} style={styles.webButton}>
          <Text style={styles.webButtonText}>Ouvrir le rapport sur le site →</Text>
        </Pressable>
      </Card>

      {sendEmail.isPending ? <Loader /> : null}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
    infoBody: {
      fontSize: 14,
      color: c.subtext,
      lineHeight: 21,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },
    kpiRow: { flexDirection: "row", marginVertical: 4 },
    kpi: { flex: 1, alignItems: "center" },
    kpiValue: { fontSize: 24, color: c.brand, fontFamily: fonts.bold },
    kpiLabel: { fontSize: 11, color: c.muted, fontFamily: fonts.body, marginTop: 2 },
    avgBlock: { gap: 4, marginTop: 8 },
    avgTitle: { fontSize: 13, color: c.muted, fontFamily: fonts.semibold },
    avgRow: { flexDirection: "row", justifyContent: "space-between" },
    avgLabel: { fontSize: 14, color: c.subtext, fontFamily: fonts.body },
    avgValue: { fontSize: 14, color: c.text, fontFamily: fonts.semibold },
    questionsInput: { minHeight: 72, textAlignVertical: "top", marginTop: 8 },
    upsellLink: { color: c.action, fontFamily: fonts.semibold, fontSize: 14, marginTop: 4 },
    hint: {
      fontSize: 13,
      color: c.muted,
      lineHeight: 19,
    },
    pills: {
      flexDirection: "row",
      gap: 8,
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillOn: {
      backgroundColor: c.brand,
      borderColor: c.brand,
    },
    pillText: {
      color: c.subtext,
      fontWeight: "500",
      fontSize: 14,
    },
    pillTextOn: {
      color: "#fff",
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.card,
    },
    successBox: {
      backgroundColor: c.successSurface,
      borderWidth: 1,
      borderColor: c.successBorder,
      borderRadius: 10,
      padding: 14,
    },
    successText: {
      color: c.success,
      fontSize: 15,
      fontWeight: "500",
      textAlign: "center",
    },
    webCard: {
      borderColor: c.brand,
      borderWidth: 1.5,
    },
    webCardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.brand,
    },
    webButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.brand,
      alignItems: "center",
    },
    webButtonText: {
      color: c.brand,
      fontSize: 15,
      fontWeight: "600",
    },
  });
