import { useMemo } from "react";

import { ChildSwitcher, MenuRow, Screen, ScreenHeader, SectionLabel } from "../components/ui";
import { useActiveChild } from "../lib/active-child";
import { useTheme } from "../lib/theme";
import { navIcon } from "../navigation/nav-icons";
import { SUIVI_SUBTITLE, SUIVI_TITLE, hubSections } from "../navigation/nav-model";
import type { SuiviHubProps } from "../navigation/types";

export function SuiviHubScreen({ navigation }: SuiviHubProps) {
  const c = useTheme();
  const { active } = useActiveChild();
  const sections = useMemo(() => hubSections(), []);
  const nav = navigation as unknown as {
    navigate: (screen: string, params?: unknown) => void;
  };
  const params = active ? { childId: active.id, childName: active.name } : undefined;

  return (
    <Screen scroll>
      <ScreenHeader title={SUIVI_TITLE} subtitle={SUIVI_SUBTITLE} />
      <ChildSwitcher />
      {sections.map((section) => (
        <SectionGroup key={section.key} title={section.title}>
          {section.rows.map((row) => {
            const Icon = navIcon(row.icon);
            return (
              <MenuRow
                key={row.to}
                icon={<Icon size={22} color={c.brand} />}
                label={row.title}
                hint={row.description}
                onPress={() => {
                  if (row.child && !params) return;
                  nav.navigate(row.root, row.child ? params : undefined);
                }}
              />
            );
          })}
        </SectionGroup>
      ))}
    </Screen>
  );
}

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SectionLabel>{title}</SectionLabel>
      {children}
    </>
  );
}
