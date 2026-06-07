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
  // Primary tab roots (read the active child from context; params optional)
  Symptoms: ChildParams | undefined;
  Journal: ChildParams | undefined;
  Routines: ChildParams | undefined;
  AddRoutine: ChildParams | undefined;
  EditRoutine: ChildParams & { routineId: string };
  // Suivi / tracking sub-screens
  Checkin: { childId?: string; childName?: string } | undefined;
  SymptomForm: ChildParams & { symptomId?: string };
  Medications: ChildParams;
  CalmMinutes: ChildParams;
  Insights: ChildParams;
  Activity: ChildParams;
  Report: ChildParams;
  // Plus (grouped menu)
  PlusMenu: undefined;
  Timer:
    | {
        sequence?: {
          routineId: string;
          childId: string;
          name: string;
          steps: {
            label: string;
            emoji?: string;
            durationSec: number;
            routineStepId: string;
          }[];
        };
      }
    | undefined;
  CompanionCollection: ChildParams;
  Barkley: ChildParams;
  BarkleyStep: ChildParams & { stepNumber: number };
  Rewards: ChildParams;
  Decodeur: ChildParams;
  Scripts: ChildParams;
  Strengths: ChildParams;
  CrisisList: ChildParams;
  CarePathway: ChildParams;
  Achievements: ChildParams;
  // Compte / account
  Settings: undefined;
  Burnout: undefined;
  Connaissances: undefined;
  ConnaissancesArticle: { slug: string; title: string };
};

/** Bottom tab bar — mirrors the PWA's primary nav. */
export type RootTabParamList = {
  AccueilTab: undefined;
  JournalTab: undefined;
  SymptomesTab: undefined;
  RoutinesTab: undefined;
  PlusTab: undefined;
};

type S<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type HomeProps = S<"Home">;
export type PlusMenuProps = S<"PlusMenu">;
export type TimerProps = S<"Timer">;
export type CompanionCollectionProps = S<"CompanionCollection">;
export type CheckinProps = S<"Checkin">;
export type SymptomsProps = S<"Symptoms">;
export type SymptomFormProps = S<"SymptomForm">;
export type MedicationsProps = S<"Medications">;
export type JournalProps = S<"Journal">;
export type CalmMinutesProps = S<"CalmMinutes">;
export type InsightsProps = S<"Insights">;
export type ActivityProps = S<"Activity">;
export type ReportProps = S<"Report">;
export type RoutinesProps = S<"Routines">;
export type AddRoutineProps = S<"AddRoutine">;
export type EditRoutineProps = S<"EditRoutine">;
export type BarkleyProps = S<"Barkley">;
export type BarkleyStepProps = S<"BarkleyStep">;
export type RewardsProps = S<"Rewards">;
export type DecodeurProps = S<"Decodeur">;
export type ScriptsProps = S<"Scripts">;
export type StrengthsProps = S<"Strengths">;
export type CrisisListProps = S<"CrisisList">;
export type CarePathwayProps = S<"CarePathway">;
export type AchievementsProps = S<"Achievements">;
export type SettingsProps = S<"Settings">;
export type BurnoutProps = S<"Burnout">;
export type ConnaissancesProps = S<"Connaissances">;
export type ConnaissancesArticleProps = S<"ConnaissancesArticle">;

export type TabProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;
