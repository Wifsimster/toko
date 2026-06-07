import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lock } from "lucide-react-native";

import { fonts } from "./ui";
import { usePremium } from "../hooks/use-billing";
import { useTheme, type Palette } from "../lib/theme";

// Reusable gate for premium-only sections, mirroring the web
// (apps/web/src/components/shared/premium-gate.tsx). While billing resolves we
// render nothing so premium users never flash the preview; premium users get
// the real feature; everyone else gets an honest preview card (title + "what
// you'd unlock" body — never a blur, per the freemium-ethics policy).
//
// Unlike the web, the locked state carries NO purchase CTA and NO payment
// link: Google Play forbids steering to external payment from a non-GPB app,
// so the abonnement is taken and managed on the web only (see
// project_mobile_billing / consumption-only model).
export function PremiumGate({
  children,
  previewTitle,
  previewBody,
}: {
  children: ReactNode;
  previewTitle: string;
  previewBody: string;
}) {
  const { isPremium, isLoading } = usePremium();
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  if (isLoading) return null;
  if (isPremium) return <>{children}</>;

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Lock size={16} color={c.tipFg} />
        <Text style={s.title}>{previewTitle}</Text>
      </View>
      <Text style={s.body}>{previewBody}</Text>
      <Text style={s.note}>
        Réservé au plan Famille, à gérer depuis votre espace Tokō sur le site web.
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.tipSurface,
      borderColor: c.tipBorder,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    head: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    body: {
      fontSize: 14,
      color: c.subtext,
      fontFamily: fonts.body,
      lineHeight: 20,
    },
    note: { fontSize: 12, color: c.muted, fontFamily: fonts.body },
  });
