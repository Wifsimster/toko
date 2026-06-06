import { ChildSwitcher, EmptyState, MenuRow, Screen, ScreenHeader } from "../components/ui";
import { useActiveChild } from "../lib/active-child";
import type { SuiviMenuProps } from "../navigation/types";

// Tracking tab: everything you log day-to-day for the active child.
export function SuiviMenuScreen({ navigation }: SuiviMenuProps) {
  const { active } = useActiveChild();

  if (!active) {
    return (
      <Screen>
        <ScreenHeader title="Suivi" />
        <EmptyState
          title="Aucun enfant sélectionné"
          body="Ajoutez ou choisissez un enfant depuis l'onglet Accueil."
        />
      </Screen>
    );
  }

  const params = { childId: active.id, childName: active.name };
  const items = [
    { emoji: "🌙", label: "Point du soir", go: () => navigation.navigate("Checkin", params) },
    { emoji: "📊", label: "Symptômes", go: () => navigation.navigate("Symptoms", params) },
    { emoji: "💊", label: "Médicaments", go: () => navigation.navigate("Medications", params) },
    { emoji: "📓", label: "Journal", go: () => navigation.navigate("Journal", params) },
    { emoji: "🌿", label: "Minutes calmes", go: () => navigation.navigate("CalmMinutes", params) },
    { emoji: "💡", label: "Insights", go: () => navigation.navigate("Insights", params) },
    { emoji: "🕑", label: "Activité", go: () => navigation.navigate("Activity", params) },
    { emoji: "📄", label: "Rapport", go: () => navigation.navigate("Report", params) },
  ];

  return (
    <Screen scroll>
      <ScreenHeader title="Suivi" subtitle={active.name} />
      <ChildSwitcher />
      {items.map((item) => (
        <MenuRow key={item.label} emoji={item.emoji} label={item.label} onPress={item.go} />
      ))}
    </Screen>
  );
}
