import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { Check, LogOut, MessagesSquare } from "lucide-react-native";
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
import { nav as navCopy } from "../lib/copy";
import { navIcon } from "../navigation/nav-icons";
import { PLUS_SCREENS, label } from "../navigation/nav-model";
import type { PlusMenuProps } from "../navigation/types";

const DISCORD_URL = `${WEB_URL}/discord`;

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

  return (
    <Screen scroll>
      <ScreenHeader title={label("nav.more")} subtitle={active ? active.name : undefined} />
      <ChildSwitcher />

      {PLUS_SCREENS.map((item) => {
        const Icon = navIcon(item.icon);
        return (
          <MenuRow
            key={item.root}
            icon={<Icon size={22} color={c.brand} />}
            label={item.title}
            onPress={go(item.root)}
          />
        );
      })}

      <SectionLabel>Communauté</SectionLabel>
      <MenuRow
        icon={<MessagesSquare size={22} color={c.brand} />}
        label={navCopy.discord}
        hint={navCopy.discordHint}
        onPress={() => WebBrowser.openBrowserAsync(DISCORD_URL)}
      />

      {billing.isSuccess && !isPremium ? (
        <Text style={styles.planNote}>
          {navCopy.premiumNote}
        </Text>
      ) : null}
      {isPremium ? (
        <View style={styles.premiumRow}>
          <Check size={16} color={c.successFg} strokeWidth={3} />
          <Text style={styles.premium}>{navCopy.premiumActive}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => authClient.signOut()}
        style={styles.signout}
        accessibilityRole="button"
      >
        <LogOut size={18} color={c.danger} />
        <Text style={styles.signoutText}>{navCopy.signOut}</Text>
      </Pressable>

      <Text style={styles.email}>{session?.user?.email}</Text>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    premiumRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
    premium: { color: c.successFg, fontFamily: fonts.semibold, marginTop: 4 },
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
