import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ChildMenu: { childId: string; childName: string };
  // Reached either from the child menu (params set) or from the evening
  // reminder deep-link (no params — the screen then resolves the child).
  Checkin: { childId?: string; childName?: string } | undefined;
  CalmMinutes: { childId: string; childName: string };
  Journal: { childId: string; childName: string };
  Routines: { childId: string; childName: string };
};

export type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;
export type ChildMenuProps = NativeStackScreenProps<RootStackParamList, "ChildMenu">;
export type CheckinProps = NativeStackScreenProps<RootStackParamList, "Checkin">;
export type CalmMinutesProps = NativeStackScreenProps<
  RootStackParamList,
  "CalmMinutes"
>;
export type JournalProps = NativeStackScreenProps<RootStackParamList, "Journal">;
export type RoutinesProps = NativeStackScreenProps<RootStackParamList, "Routines">;
