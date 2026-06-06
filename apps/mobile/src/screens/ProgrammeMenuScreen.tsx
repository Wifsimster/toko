import { ChildSwitcher, EmptyState, MenuRow, Screen, ScreenHeader } from "../components/ui";
import { useActiveChild } from "../lib/active-child";
import type { ProgrammeMenuProps } from "../navigation/types";

// Programme tab: behaviour tools and the structured ADHD programme.
export function ProgrammeMenuScreen({ navigation }: ProgrammeMenuProps) {
  const { active } = useActiveChild();

  if (!active) {
    return (
      <Screen>
        <ScreenHeader title="Programme" />
        <EmptyState
          title="Aucun enfant sélectionné"
          body="Ajoutez ou choisissez un enfant depuis l'onglet Accueil."
        />
      </Screen>
    );
  }

  const params = { childId: active.id, childName: active.name };
  const items = [
    { emoji: "✅", label: "Routines", go: () => navigation.navigate("Routines", params) },
    { emoji: "🎯", label: "Programme Barkley", go: () => navigation.navigate("Barkley", params) },
    { emoji: "🎁", label: "Récompenses", go: () => navigation.navigate("Rewards", params) },
    { emoji: "🔎", label: "Décodeur", go: () => navigation.navigate("Decodeur", params) },
    { emoji: "💬", label: "Scripts", go: () => navigation.navigate("Scripts", params) },
    { emoji: "⭐", label: "Forces", go: () => navigation.navigate("Strengths", params) },
    { emoji: "🆘", label: "Liste de la crise", go: () => navigation.navigate("CrisisList", params) },
    { emoji: "🩺", label: "Parcours de soin", go: () => navigation.navigate("CarePathway", params) },
    { emoji: "🏅", label: "Réussites", go: () => navigation.navigate("Achievements", params) },
  ];

  return (
    <Screen scroll>
      <ScreenHeader title="Programme" subtitle={active.name} />
      <ChildSwitcher />
      {items.map((item) => (
        <MenuRow key={item.label} emoji={item.emoji} label={item.label} onPress={item.go} />
      ))}
    </Screen>
  );
}
