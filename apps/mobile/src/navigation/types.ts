import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import type { CompanionSlot } from "../lib/companion-slots";

/** Params shared by every child-scoped screen. */
export type ChildParams = { childId: string; childName: string };

/**
 * All screens, across every tab's stack. A single param list keeps the
 * existing screens' prop types valid and lets screens navigate to any screen
 * (react-navigation resolves the name in the owning stack at runtime).
 */
export type RootStackParamList = {
  // Auth (signed out)
  Login: undefined;
  Register: undefined;
  /** `email` pré-remplit le champ avec ce que le parent a saisi à la connexion. */
  ForgotPassword: { email?: string } | undefined;
  // Accueil
  Home: undefined;
  // Primary tab roots (read the active child from context; params optional)
  Symptoms: ChildParams | undefined;
  Journal: ChildParams | undefined;
  Routines:
    | (Partial<ChildParams> & {
        // Phase 4 companion: restrict the screen to one half of the day so the
        // Matin / Soir tabs show only their routines. Absent (full port / web)
        // ⇒ all routines. See lib/companion-slots.ts for the timeOfDay mapping.
        slot?: CompanionSlot;
      })
    | undefined;
  AddRoutine: ChildParams | undefined;
  EditRoutine: ChildParams & { routineId: string };
  // Suivi / tracking sub-screens
  Checkin: { childId?: string; childName?: string } | undefined;
  SymptomForm: ChildParams & { symptomId?: string };
  Medications: ChildParams;
  CalmMinutes: ChildParams;
  Insights: ChildParams;
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
  CrisisList: ChildParams;
  // Compte / account
  Settings: undefined;
  /** Choix et ordre des onglets de la barre du bas (par compte). */
  MenuBar: undefined;
  Connaissances: undefined;
  ConnaissancesArticle: { slug: string; title: string };
};

type TabStack = NavigatorScreenParams<RootStackParamList> | undefined;

/**
 * Bottom tab bar. Accueil (first) and Plus (last) are always mounted; the
 * middle tabs are chosen per account (src/navigation/tabs.tsx), so any of
 * them may be absent: navigate to a section with `useOpenSection`, never to
 * a middle tab by name.
 */
export type RootTabParamList = {
  AccueilTab: TabStack;
  ArticlesTab: TabStack;
  RoutinesTab: TabStack;
  MinuteurTab: TabStack;
  JournalTab: TabStack;
  SymptomesTab: TabStack;
  MedicamentsTab: TabStack;
  PlusTab: TabStack;
};

// Phase 4 companion — the 3 tabs of the trimmed native surface.
export type CompanionTabParamList = {
  MatinTab: undefined;
  SoirTab: undefined;
  TimerTab: undefined;
};

type S<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type LoginProps = S<"Login">;
export type RegisterProps = S<"Register">;
export type ForgotPasswordProps = S<"ForgotPassword">;
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
export type ReportProps = S<"Report">;
export type RoutinesProps = S<"Routines">;
export type AddRoutineProps = S<"AddRoutine">;
export type EditRoutineProps = S<"EditRoutine">;
export type BarkleyProps = S<"Barkley">;
export type BarkleyStepProps = S<"BarkleyStep">;
export type RewardsProps = S<"Rewards">;
export type CrisisListProps = S<"CrisisList">;
export type SettingsProps = S<"Settings">;
export type MenuBarProps = S<"MenuBar">;
export type ConnaissancesProps = S<"Connaissances">;
export type ConnaissancesArticleProps = S<"ConnaissancesArticle">;

export type TabProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;
