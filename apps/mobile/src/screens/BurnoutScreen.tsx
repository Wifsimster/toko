import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import {
  Button,
  CalloutCard,
  Card,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import type { BurnoutProps } from "../navigation/types";

// Parental burn-out self-assessment, ported from the PWA /burnout (Roskam &
// Mikolajczak inspired). 7 questions on a 0–3 scale, total /21, three zones.
// Client-side only — nothing is stored (a guilt-free mirror, not a diagnosis).
// The parent mood logger (1–5) lives on the Home dashboard, not here.
const QUESTIONS = [
  "Je me sens épuisé·e dès le matin quand je pense à la journée avec mon enfant.",
  "À la fin de la journée, mes ressources émotionnelles sont vides.",
  "Je me sens distant·e affectivement avec mon enfant, comme en retrait.",
  "Je ne reconnais plus le parent que j'étais avant.",
  "Je culpabilise souvent d'être un·e mauvais·e parent.",
  "Je n'ai plus d'énergie pour les moments simples : jeu, câlin, rire.",
  "Je pense parfois que je ne peux plus assumer ce rôle.",
];
const SCALE = ["Jamais", "Parfois", "Souvent", "Tout le temps"];

type Zone = "green" | "orange" | "red";
function zoneFromScore(score: number): Zone {
  if (score <= 6) return "green";
  if (score <= 13) return "orange";
  return "red";
}
const ZONE = {
  green: {
    variant: "success" as const,
    label: "Vous tenez bon",
    title: "Pas de signaux d'épuisement marqués.",
    body: "Vous traversez la parentalité TDAH avec des ressources. Ne sous-estimez pas pour autant la fatigue : prenez les pauses dont vous avez besoin, même quand tout semble aller.",
  },
  orange: {
    variant: "alert" as const,
    label: "Fatigue notable",
    title: "Des signes de fatigue qui méritent attention.",
    body: "Ce que vous ressentez est réel, et c'est le bon moment pour ralentir. Diminuez ce qui peut l'être, parlez-en à un proche, et envisagez d'en parler à votre médecin si la fatigue s'installe.",
  },
  red: {
    variant: "alert" as const,
    label: "Signaux forts",
    title: "Vous portez beaucoup. Vous n'êtes pas seul·e.",
    body: "Ce que vous traversez ressemble à un épuisement parental significatif. Ce n'est pas une faiblesse, ce n'est pas votre responsabilité. C'est un signal d'alerte qui mérite un échange avec un professionnel — médecin traitant, psychologue, ou un des numéros d'écoute ci-dessous.",
  },
};

const SUPPORT = [
  { label: "3114 — Prévention du suicide", hint: "Gratuit, 24h/24, anonyme", url: "tel:3114" },
  { label: "Allô Parents Bébé", hint: "0 800 235 236 · écoute parentale", url: "tel:0800235236" },
  { label: "HyperSupers TDAH France", hint: "Soutien et orientation TDAH", url: "https://www.tdah-france.fr/" },
];

export function BurnoutScreen({ navigation }: BurnoutProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [answers, setAnswers] = useState<(number | null)[]>(
    () => QUESTIONS.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  const total = answers.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const allAnswered = answers.every((a) => a !== null);

  function setAnswer(i: number, v: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }
  function reset() {
    setAnswers(QUESTIONS.map(() => null));
    setSubmitted(false);
  }

  if (submitted) {
    const zone = ZONE[zoneFromScore(total)];
    return (
      <Screen scroll>
        <ScreenHeader
          title="Est-ce un burn-out parental ?"
          onBack={() => navigation.goBack()}
        />
        <CalloutCard variant={zone.variant} label={zone.label}>
          <Text style={styles.score}>Score : {total} sur 21</Text>
          <Text style={styles.zoneTitle}>{zone.title}</Text>
          <Text style={styles.zoneBody}>{zone.body}</Text>
        </CalloutCard>

        <Card>
          <Text style={styles.supportTitle}>Vous pouvez en parler maintenant</Text>
          <Text style={styles.supportBody}>
            Ces lignes sont gratuites, anonymes et ouvertes aux parents en
            difficulté. Vous n'avez pas besoin d'avoir trouvé les bons mots pour
            appeler.
          </Text>
          {SUPPORT.map((s) => (
            <Pressable
              key={s.url}
              onPress={() => Linking.openURL(s.url)}
              style={styles.supportRow}
              accessibilityRole="button"
            >
              <Text style={styles.supportLink}>{s.label}</Text>
              <Text style={styles.supportHint}>{s.hint}</Text>
            </Pressable>
          ))}
        </Card>

        <Button label="Refaire le test" variant="secondary" onPress={reset} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Est-ce un burn-out parental ?"
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.subtitle}>
        Sept questions courtes pour mettre des mots sur ce que vous traversez.
        Aucun jugement, aucune mémorisation de votre réponse.
      </Text>

      <CalloutCard variant="info" label="À lire d'abord">
        <Text style={styles.disclaimer}>
          Ce test n'est pas un diagnostic médical. C'est un miroir : il vous aide
          à reconnaître ce que vous ressentez. Seul un médecin ou un psychologue
          peut évaluer un burn-out parental.
        </Text>
      </CalloutCard>

      <Text style={styles.formTitle}>Au cours des deux dernières semaines</Text>

      {QUESTIONS.map((q, i) => (
        <Card key={i}>
          <Text style={styles.question}>
            {i + 1}. {q}
          </Text>
          <View style={styles.scaleRow}>
            {SCALE.map((label, v) => {
              const on = answers[i] === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setAnswer(i, v)}
                  style={[styles.scaleChip, on && styles.scaleChipOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.scaleText, on && styles.scaleTextOn]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}

      <Button
        label="Voir le résultat"
        onPress={() => setSubmitted(true)}
        disabled={!allAnswered}
      />
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    subtitle: { fontSize: 14, color: c.muted, fontFamily: fonts.body, lineHeight: 20 },
    disclaimer: { fontSize: 13, color: c.infoFg, fontFamily: fonts.body, lineHeight: 19 },
    formTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold, marginTop: 4 },
    question: { fontSize: 15, color: c.text, fontFamily: fonts.medium, lineHeight: 21 },
    scaleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
    scaleChip: {
      flexGrow: 1,
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
    },
    scaleChipOn: { backgroundColor: c.brand, borderColor: c.brand },
    scaleText: { fontSize: 13, color: c.subtext, fontFamily: fonts.medium },
    scaleTextOn: { color: "#fff", fontFamily: fonts.semibold },
    score: { fontSize: 15, color: c.text, fontFamily: fonts.bold },
    zoneTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    zoneBody: { fontSize: 14, color: c.subtext, fontFamily: fonts.body, lineHeight: 21 },
    supportTitle: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    supportBody: { fontSize: 13, color: c.muted, fontFamily: fonts.body, lineHeight: 19 },
    supportRow: {
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    supportLink: { fontSize: 15, color: c.brand, fontFamily: fonts.semibold },
    supportHint: { fontSize: 12, color: c.muted, fontFamily: fonts.body, marginTop: 1 },
  });
