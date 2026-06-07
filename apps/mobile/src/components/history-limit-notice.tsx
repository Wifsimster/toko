import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clock } from "lucide-react-native";

import { fonts } from "./ui";
import { usePremium } from "../hooks/use-billing";
import { useTheme, type Palette } from "../lib/theme";

// Honest footer shown to free users under a journal / symptom-history list:
// the list only covers the last 30 days (enforced server-side). The Famille
// plan unlocks the full history. No purchase CTA or payment link — the
// abonnement is managed on the web only (Google Play consumption-only model,
// see project_mobile_billing).
export function HistoryLimitNotice() {
  const { isPremium, isLoading } = usePremium();
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  if (isLoading || isPremium) return null;

  return (
    <View style={s.row}>
      <Clock size={14} color={c.muted} />
      <Text style={s.text}>
        Vous voyez les 30 derniers jours. L'historique complet de suivi fait
        partie du plan Famille, à gérer depuis votre espace Tokō sur le site web.
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      paddingVertical: 8,
    },
    text: {
      flex: 1,
      fontSize: 12,
      color: c.muted,
      fontFamily: fonts.body,
      lineHeight: 17,
    },
  });
