import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import {
  Activity,
  Award,
  Book,
  Brain,
  HandHeart,
  HeartPulse,
  Leaf,
  Library,
  LogOut,
  MessageSquareText,
  Pill,
  MessagesSquare,
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
  fonts,
} from "../components/ui";
import { useTheme, type Palette } from "../lib/theme";
import { fetchBillingStatus } from "../lib/api";
import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { WEB_URL } from "../lib/config";
import type { PlusMenuProps } from "../navigation/types";

// Via la redirection serveur (app.ts) : l'invitation peut changer sans
// republier l'app.
const DISCORD_URL = `${WEB_URL}/discord`;

const ic = (Icon: typeof Library, color: string) => <Icon size={22} color={color} />;

export function PlusMenuScreen({ navigation }: PlusMenuProps) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
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
      <MenuRow icon={ic(Library, c.brand)} label="Connaissances" onPress={goPlain("Connaissances")} />
      <MenuRow icon={ic(Book, c.brand)} label="Programme Barkley" onPress={go("Barkley")} />
      <MenuRow icon={ic(Brain, c.brand)} label="Décodeur" onPress={go("Decodeur")} />
      <MenuRow icon={ic(MessageSquareText, c.brand)} label="Scripts" onPress={go("Scripts")} />
      <MenuRow icon={ic(Timer, c.brand)} label="Minuteur visuel" onPress={goPlain("Timer")} />

      <SectionLabel>Suivi</SectionLabel>
      <MenuRow icon={ic(Pill, c.brand)} label="Médicaments" onPress={go("Medications")} />
      <MenuRow icon={ic(Sparkles, c.brand)} label="Forces" onPress={go("Strengths")} />
      <MenuRow icon={ic(Leaf, c.brand)} label="Minutes calmes" onPress={go("CalmMinutes")} />
      <MenuRow icon={ic(TrendingUp, c.brand)} label="Insights" onPress={go("Insights")} />
      <MenuRow icon={ic(Activity, c.brand)} label="Activité" onPress={go("Activity")} />
      <MenuRow icon={ic(Book, c.brand)} label="Rapport" onPress={go("Report")} />

      <SectionLabel>Soins</SectionLabel>
      <MenuRow icon={ic(HandHeart, c.brand)} label="Liste de la crise" onPress={go("CrisisList")} />
      <MenuRow icon={ic(Stethoscope, c.brand)} label="Parcours de soin" onPress={go("CarePathway")} />
      <MenuRow icon={ic(HeartPulse, c.brand)} label="Mon énergie de parent" onPress={goPlain("Burnout")} />

      <SectionLabel>Communauté</SectionLabel>
      <MenuRow
        icon={ic(MessagesSquare, c.brand)}
        label="Retrouvez-nous sur Discord"
        hint="Échangez avec d'autres parents"
        onPress={() => WebBrowser.openBrowserAsync(DISCORD_URL)}
      />

      <SectionLabel>Compte</SectionLabel>
      <MenuRow icon={ic(Trophy, c.brand)} label="Récompenses" onPress={go("Rewards")} />
      <MenuRow icon={ic(Award, c.brand)} label="Réussites" onPress={go("Achievements")} />
      <MenuRow icon={ic(SettingsIcon, c.brand)} label="Réglages" onPress={goPlain("Settings")} />

      {billing.isSuccess && !isPremium ? (
        <Text style={styles.planNote}>
          Premium se gère depuis votre espace Tokō sur le site web.
        </Text>
      ) : null}
      {isPremium ? <Text style={styles.premium}>✓ Premium actif</Text> : null}

      <Pressable
        onPress={() => authClient.signOut()}
        style={styles.signout}
        accessibilityRole="button"
      >
        <LogOut size={18} color={c.danger} />
        <Text style={styles.signoutText}>Se déconnecter</Text>
      </Pressable>

      <Text style={styles.email}>{session?.user?.email}</Text>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    premium: { color: c.success, fontFamily: fonts.semibold, marginTop: 4 },
    planNote: { color: c.muted, fontSize: 13, fontFamily: fonts.body, marginTop: 4 },
    signout: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      minHeight: 44,
    },
    signoutText: { color: c.danger, fontSize: 16, fontFamily: fonts.medium },
    email: { color: c.muted, fontSize: 12, fontFamily: fonts.body, marginTop: 4 },
  });
