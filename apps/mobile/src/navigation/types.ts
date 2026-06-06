import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  // Reached either from the Home child list (params set) or from the evening
  // reminder deep-link (no params — the screen then resolves the child).
  Checkin: { childId?: string; childName?: string } | undefined;
  CalmMinutes: { childId: string; childName: string };
};

export type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;
export type CheckinProps = NativeStackScreenProps<RootStackParamList, "Checkin">;
export type CalmMinutesProps = NativeStackScreenProps<
  RootStackParamList,
  "CalmMinutes"
>;
