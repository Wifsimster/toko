import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { Pressable, Text } from "react-native";

import { MenuRow, Screen, ScreenHeader, colors } from "../components/ui";
import { fetchBillingStatus } from "../lib/api";
import { authClient } from "../lib/auth";
import { WEB_URL } from "../lib/config";
import type { CompteProps } from "../navigation/types";

// Account tab: settings, parent wellbeing, knowledge, subscription, sign out.
export function CompteScreen({ navigation }: CompteProps) {
  const { data: session } = authClient.useSession();
  const billing = useQuery({ queryKey: ["billing"], queryFn: fetchBillingStatus });
  const isPremium = billing.data?.active || billing.data?.granted;

  return (
    <Screen scroll>
      <ScreenHeader title="Compte" subtitle={session?.user?.email ?? undefined} />

      <MenuRow emoji="⚙️" label="Réglages" onPress={() => navigation.navigate("Settings")} />
      <MenuRow
        emoji="🧡"
        label="Mon énergie de parent"
        hint="Auto-évaluation burn-out"
        onPress={() => navigation.navigate("Burnout")}
      />
      <MenuRow
        emoji="📚"
        label="Connaissances"
        hint="Articles pour comprendre le TDAH"
        onPress={() => navigation.navigate("Connaissances")}
      />

      {billing.isSuccess && !isPremium ? (
        <MenuRow
          emoji="✨"
          label="S'abonner à Premium"
          hint="L'abonnement se prend sur le site"
          onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/abonnement`)}
        />
      ) : null}
      {isPremium ? (
        <Text style={{ color: colors.success, fontWeight: "600", marginTop: 4 }}>
          ✓ Premium actif
        </Text>
      ) : null}

      <Pressable
        onPress={() => authClient.signOut()}
        style={{ marginTop: 12, padding: 12 }}
      >
        <Text style={{ color: colors.danger, fontSize: 16 }}>Se déconnecter</Text>
      </Pressable>
    </Screen>
  );
}
