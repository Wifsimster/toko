import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import {
  Activity,
  Award,
  Book,
  Brain,
  HandHeart,
  HeartPulse,
  Library,
  LogOut,
  MessageSquareText,
  Pill,
  Settings as SettingsIcon,
  Sparkles,
  Stethoscope,
  Timer,
  Trophy,
  TrendingUp,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ChildSwitcher,
  MenuRow,
  Screen,
  ScreenHeader,
  SectionLabel,
  colors,
  fonts,
} from "../components/ui";
import { fetchBillingStatus } from "../lib/api";
import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { WEB_URL } from "../lib/config";
import type { PlusMenuProps } from "../navigation/types";

const ic = (Icon: typeof Library) => <Icon size={22} color={colors.brand} />;

export function PlusMenuScreen({ navigation }: PlusMenuProps) {
  const { active } = useActiveChild();
  const { data: session } = authClient.useSession();
  const billing = useQuery({ queryKey: ["billing"], queryFn: fetchBillingStatus });
  const isPremium = billing.data?.active || billing.data?.granted;

  const p = active ? { childId: active.id, childName: active.name } : undefined;
  const nav = navigation as unknown as {
    navigate: (screen: string, params?: unknown) => void;
  };
  const go = (screen: string) => () => {
    if (p) nav.navigate(screen, p);
  };
  const goPlain = (screen: string) => () => nav.navigate(screen);

  return (
    <Screen scroll>
      <ScreenHeader title="Plus" subtitle={active ? active.name : undefined} />
      <ChildSwitcher />

      <SectionLabel>Ressources</SectionLabel>
      <MenuRow icon={ic(Library)} label="Connaissances" onPress={goPlain("Connaissances")} />
      <MenuRow icon={ic(Book)} label="Programme Barkley" onPress={go("Barkley")} />
      <MenuRow icon={ic(Brain)} label="Décodeur" onPress={go("Decodeur")} />
      <MenuRow icon={ic(MessageSquareText)} label="Scripts" onPress={go("Scripts")} />

      <SectionLabel>Suivi</SectionLabel>
      <MenuRow icon={ic(Pill)} label="Médicaments" onPress={go("Medications")} />
      <MenuRow icon={ic(Sparkles)} label="Forces" onPress={go("Strengths")} />
      <MenuRow icon={ic(Timer)} label="Minutes calmes" onPress={go("CalmMinutes")} />
      <MenuRow icon={ic(TrendingUp)} label="Insights" onPress={go("Insights")} />
      <MenuRow icon={ic(Activity)} label="Activité" onPress={go("Activity")} />
      <MenuRow icon={ic(Book)} label="Rapport" onPress={go("Report")} />

      <SectionLabel>Soins</SectionLabel>
      <MenuRow icon={ic(HandHeart)} label="Liste de la crise" onPress={go("CrisisList")} />
      <MenuRow icon={ic(Stethoscope)} label="Parcours de soin" onPress={go("CarePathway")} />
      <MenuRow icon={ic(HeartPulse)} label="Mon énergie de parent" onPress={goPlain("Burnout")} />

      <SectionLabel>Compte</SectionLabel>
      <MenuRow icon={ic(Trophy)} label="Récompenses" onPress={go("Rewards")} />
      <MenuRow icon={ic(Award)} label="Réussites" onPress={go("Achievements")} />
      <MenuRow icon={ic(SettingsIcon)} label="Réglages" onPress={goPlain("Settings")} />

      {billing.isSuccess && !isPremium ? (
        <MenuRow
          icon={ic(Sparkles)}
          label="S'abonner à Premium"
          hint="L'abonnement se prend sur le site"
          onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/abonnement`)}
        />
      ) : null}
      {isPremium ? <Text style={styles.premium}>✓ Premium actif</Text> : null}

      <Pressable
        onPress={() => authClient.signOut()}
        style={styles.signout}
        accessibilityRole="button"
      >
        <LogOut size={18} color={colors.danger} />
        <Text style={styles.signoutText}>Se déconnecter</Text>
      </Pressable>

      <Text style={styles.email}>{session?.user?.email}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  premium: { color: colors.success, fontFamily: fonts.semibold, marginTop: 4 },
  signout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    minHeight: 44,
  },
  signoutText: { color: colors.danger, fontSize: 16, fontFamily: fonts.medium },
  email: { color: colors.muted, fontSize: 12, fontFamily: fonts.body, marginTop: 4 },
});
