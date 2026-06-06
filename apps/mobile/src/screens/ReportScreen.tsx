import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  Card,
  ErrorNote,
  Loader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  colors,
} from "../components/ui";
import { useSendReportEmail, type ReportPeriod } from "../hooks/use-report";
import { WEB_URL } from "../lib/config";
import type { ReportProps } from "../navigation/types";

// ─── Period pills ─────────────────────────────────────────────────────────────

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "week", label: "7 jours" },
  { value: "month", label: "30 jours" },
  { value: "quarter", label: "3 mois" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ReportScreen({ navigation, route }: ReportProps) {
  const { childId, childName } = route.params;

  const [period, setPeriod] = useState<ReportPeriod>("quarter");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const sendEmail = useSendReportEmail();

  function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    sendEmail.mutate(
      { childId, recipientEmail: trimmed, period },
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
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

const styles = StyleSheet.create({
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  infoBody: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 21,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.muted,
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
    borderColor: colors.border,
  },
  pillOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pillText: {
    color: colors.subtext,
    fontWeight: "500",
    fontSize: 14,
  },
  pillTextOn: {
    color: "#fff",
    fontWeight: "600",
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
  successBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 10,
    padding: 14,
  },
  successText: {
    color: colors.success,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  webCard: {
    borderColor: colors.brand,
    borderWidth: 1.5,
  },
  webCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.brand,
  },
  webButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand,
    alignItems: "center",
  },
  webButtonText: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: "600",
  },
});
