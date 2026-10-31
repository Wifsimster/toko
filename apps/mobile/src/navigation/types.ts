import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import type { CompanionSlot } from "../lib/companion-slots";

export type ChildParams = { childId: string; childName: string };

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { email?: string } | undefined;
  Home: undefined;
  Symptoms: ChildParams | undefined;
  Journal: ChildParams | undefined;
  Routines:
    | (Partial<ChildParams> & {
        slot?: CompanionSlot;
      })
    | undefined;
  AddRoutine: ChildParams | undefined;
  EditRoutine: ChildParams & { routineId: string };
  Checkin: { childId?: string; childName?: string } | undefined;
  SymptomForm: ChildParams & { symptomId?: string };
  Medications: ChildParams;
  CalmMinutes: ChildParams;
  Insights: ChildParams;
  Report: ChildParams;
  PlusMenu: undefined;
  SuiviHub: undefined;
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
  Settings: undefined;
  Connaissances: undefined;
  ConnaissancesArticle: { slug: string; title: string };
};

type TabStack = NavigatorScreenParams<RootStackParamList> | undefined;

export type RootTabParamList = {
  AccueilTab: TabStack;
  SuiviTab: TabStack;
  BarkleyTab: TabStack;
  CompteTab: TabStack;
  PlusTab: TabStack;
};

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
export type SuiviHubProps = S<"SuiviHub">;
export type ConnaissancesProps = S<"Connaissances">;
export type ConnaissancesArticleProps = S<"ConnaissancesArticle">;

export type TabProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;
