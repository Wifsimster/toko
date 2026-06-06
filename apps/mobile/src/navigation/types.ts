import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

/** Params shared by every child-scoped screen. */
export type ChildParams = { childId: string; childName: string };

/**
 * All screens, across every tab's stack. A single param list keeps the
 * existing screens' prop types valid and lets screens navigate to any screen
 * (react-navigation resolves the name in the owning stack at runtime).
 */
export type RootStackParamList = {
  Login: undefined;
  // Accueil
  Home: undefined;
  // Suivi
  SuiviMenu: undefined;
  Checkin: { childId?: string; childName?: string } | undefined;
  Symptoms: ChildParams;
  Medications: ChildParams;
  Journal: ChildParams;
  CalmMinutes: ChildParams;
  Insights: ChildParams;
  Activity: ChildParams;
  Report: ChildParams;
  // Programme
  ProgrammeMenu: undefined;
  Routines: ChildParams;
  Barkley: ChildParams;
  Rewards: ChildParams;
  Decodeur: ChildParams;
  Scripts: ChildParams;
  Strengths: ChildParams;
  CrisisList: ChildParams;
  CarePathway: ChildParams;
  Achievements: ChildParams;
  // Compte
  Compte: undefined;
  Settings: undefined;
  Burnout: undefined;
  Connaissances: undefined;
};

/** Bottom tab bar. */
export type RootTabParamList = {
  AccueilTab: undefined;
  SuiviTab: undefined;
  ProgrammeTab: undefined;
  CompteTab: undefined;
};

type S<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type HomeProps = S<"Home">;
export type SuiviMenuProps = S<"SuiviMenu">;
export type CheckinProps = S<"Checkin">;
export type SymptomsProps = S<"Symptoms">;
export type MedicationsProps = S<"Medications">;
export type JournalProps = S<"Journal">;
export type CalmMinutesProps = S<"CalmMinutes">;
export type InsightsProps = S<"Insights">;
export type ActivityProps = S<"Activity">;
export type ReportProps = S<"Report">;
export type ProgrammeMenuProps = S<"ProgrammeMenu">;
export type RoutinesProps = S<"Routines">;
export type BarkleyProps = S<"Barkley">;
export type RewardsProps = S<"Rewards">;
export type DecodeurProps = S<"Decodeur">;
export type ScriptsProps = S<"Scripts">;
export type StrengthsProps = S<"Strengths">;
export type CrisisListProps = S<"CrisisList">;
export type CarePathwayProps = S<"CarePathway">;
export type AchievementsProps = S<"Achievements">;
export type CompteProps = S<"Compte">;
export type SettingsProps = S<"Settings">;
export type BurnoutProps = S<"Burnout">;
export type ConnaissancesProps = S<"Connaissances">;

export type TabProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;
