import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DISCORD_INVITE_URL } from "@focusflow/validators";
import { Check, LogOut, MessagesSquare, PanelBottom } from "lucide-react-native";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

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
import { menuBar as menuBarCopy, nav as navCopy, plus as plusCopy } from "../lib/copy";
import { navIcon } from "../navigation/nav-icons";
import { PLUS_GROUPS, label } from "../navigation/nav-model";
import type { PlusMenuProps } from "../navigation/types";

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
  const go = (screen: string, child: boolean) => () => {
    if (!child) nav.navigate(screen);
    else if (p) nav.navigate(screen, p);
  };

  return (
    <Screen scroll>
      <ScreenHeader title={label("nav.more")} subtitle={active ? active.name : undefined} />
      <ChildSwitcher />

      {PLUS_GROUPS.map((group) => (
        <View key={group.key} style={styles.group}>
          <SectionLabel>{group.title}</SectionLabel>
          {group.items.map((item) => {
            const Icon = navIcon(item.icon);
            return (
              <MenuRow
                key={item.id}
                icon={<Icon size={22} color={c.brand} />}
                label={item.title}
                hint={item.description}
                onPress={go(item.root, item.child)}
              />
            );
          })}
          {group.key === "account" ? (
            <MenuRow
              icon={<PanelBottom size={22} color={c.brand} />}
              label={menuBarCopy.title}
              hint={menuBarCopy.rowHint}
              onPress={go("MenuBar", false)}
            />
          ) : null}
        </View>
      ))}

      <SectionLabel>{plusCopy.community}</SectionLabel>
      <MenuRow
        icon={<MessagesSquare size={22} color={c.brand} />}
        label={navCopy.discord}
        hint={navCopy.discordHint}
        onPress={() => Linking.openURL(DISCORD_INVITE_URL)}
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
    group: { gap: 14 },
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
