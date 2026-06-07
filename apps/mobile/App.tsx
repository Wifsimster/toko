import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Activity,
  BookOpen,
  House,
  ListChecks,
  Menu,
  type LucideIcon,
} from "lucide-react-native";
import { useFonts } from "expo-font";
import {
  SourceSerif4_600SemiBold,
  SourceSerif4_700Bold,
} from "@expo-google-fonts/source-serif-4";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { colors, fonts, useTheme } from "./src/components/ui";
import { ActiveChildProvider } from "./src/lib/active-child";
import { authClient } from "./src/lib/auth";
import { setupOnlineManager } from "./src/lib/online";
import { persister, queryClient } from "./src/lib/query";
import { linking } from "./src/navigation/linking";
import type {
  RootStackParamList,
  RootTabParamList,
} from "./src/navigation/types";
// Accueil
import { HomeScreen } from "./src/screens/HomeScreen";
// Journal
import { JournalScreen } from "./src/screens/JournalScreen";
// Symptômes (+ tracking sub-screens reached from the dashboard)
import { SymptomsScreen } from "./src/screens/SymptomsScreen";
import { SymptomFormScreen } from "./src/screens/SymptomFormScreen";
import { EveningCheckinScreen } from "./src/screens/EveningCheckinScreen";
// Routines
import { RoutinesScreen } from "./src/screens/RoutinesScreen";
import { AddRoutineScreen } from "./src/screens/AddRoutineScreen";
import { EditRoutineScreen } from "./src/screens/EditRoutineScreen";
// Plus (grouped menu + every secondary screen)
import { PlusMenuScreen } from "./src/screens/PlusMenuScreen";
import { TimerScreen } from "./src/screens/TimerScreen";
import { MedicationsScreen } from "./src/screens/MedicationsScreen";
import { CalmMinutesScreen } from "./src/screens/CalmMinutesScreen";
import { InsightsScreen } from "./src/screens/InsightsScreen";
import { ActivityScreen } from "./src/screens/ActivityScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { BarkleyScreen } from "./src/screens/BarkleyScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { DecodeurScreen } from "./src/screens/DecodeurScreen";
import { ScriptsScreen } from "./src/screens/ScriptsScreen";
import { StrengthsScreen } from "./src/screens/StrengthsScreen";
import { CrisisListScreen } from "./src/screens/CrisisListScreen";
import { CarePathwayScreen } from "./src/screens/CarePathwayScreen";
import { AchievementsScreen } from "./src/screens/AchievementsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { BurnoutScreen } from "./src/screens/BurnoutScreen";
import { ConnaissancesScreen } from "./src/screens/ConnaissancesScreen";
import { ConnaissancesArticleScreen } from "./src/screens/ConnaissancesArticleScreen";
// Auth
import { LoginScreen } from "./src/screens/LoginScreen";

const DAY_MS = 1000 * 60 * 60 * 24;

setupOnlineManager();

const Tab = createBottomTabNavigator<RootTabParamList>();
const AccueilStack = createNativeStackNavigator<RootStackParamList>();
const JournalStack = createNativeStackNavigator<RootStackParamList>();
const SymptomesStack = createNativeStackNavigator<RootStackParamList>();
const RoutinesStack = createNativeStackNavigator<RootStackParamList>();
const PlusStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<RootStackParamList>();

const stackOptions = { headerShown: false } as const;

function AccueilNavigator() {
  return (
    <AccueilStack.Navigator screenOptions={stackOptions}>
      <AccueilStack.Screen name="Home" component={HomeScreen} />
    </AccueilStack.Navigator>
  );
}

function JournalNavigator() {
  return (
    <JournalStack.Navigator screenOptions={stackOptions}>
      <JournalStack.Screen name="Journal" component={JournalScreen} />
    </JournalStack.Navigator>
  );
}

function SymptomesNavigator() {
  return (
    <SymptomesStack.Navigator screenOptions={stackOptions}>
      <SymptomesStack.Screen name="Symptoms" component={SymptomsScreen} />
      <SymptomesStack.Screen name="Checkin" component={EveningCheckinScreen} />
      <SymptomesStack.Screen name="SymptomForm" component={SymptomFormScreen} />
    </SymptomesStack.Navigator>
  );
}

function RoutinesNavigator() {
  return (
    <RoutinesStack.Navigator screenOptions={stackOptions}>
      <RoutinesStack.Screen name="Routines" component={RoutinesScreen} />
      <RoutinesStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <RoutinesStack.Screen name="EditRoutine" component={EditRoutineScreen} />
    </RoutinesStack.Navigator>
  );
}

function PlusNavigator() {
  return (
    <PlusStack.Navigator screenOptions={stackOptions}>
      <PlusStack.Screen name="PlusMenu" component={PlusMenuScreen} />
      <PlusStack.Screen name="Timer" component={TimerScreen} />
      <PlusStack.Screen name="Medications" component={MedicationsScreen} />
      <PlusStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
      <PlusStack.Screen name="Insights" component={InsightsScreen} />
      <PlusStack.Screen name="Activity" component={ActivityScreen} />
      <PlusStack.Screen name="Report" component={ReportScreen} />
      <PlusStack.Screen name="Barkley" component={BarkleyScreen} />
      <PlusStack.Screen name="Rewards" component={RewardsScreen} />
      <PlusStack.Screen name="Decodeur" component={DecodeurScreen} />
      <PlusStack.Screen name="Scripts" component={ScriptsScreen} />
      <PlusStack.Screen name="Strengths" component={StrengthsScreen} />
      <PlusStack.Screen name="CrisisList" component={CrisisListScreen} />
      <PlusStack.Screen name="CarePathway" component={CarePathwayScreen} />
      <PlusStack.Screen name="Achievements" component={AchievementsScreen} />
      <PlusStack.Screen name="Settings" component={SettingsScreen} />
      <PlusStack.Screen name="Burnout" component={BurnoutScreen} />
      <PlusStack.Screen name="Connaissances" component={ConnaissancesScreen} />
      <PlusStack.Screen
        name="ConnaissancesArticle"
        component={ConnaissancesArticleScreen}
      />
    </PlusStack.Navigator>
  );
}

function tabIcon(Icon: LucideIcon) {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
}

function AuthedTabs() {
  const c = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.action,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarLabelStyle: { fontFamily: fonts.medium },
      }}
    >
      <Tab.Screen
        name="AccueilTab"
        component={AccueilNavigator}
        options={{ title: "Accueil", tabBarIcon: tabIcon(House) }}
      />
      <Tab.Screen
        name="JournalTab"
        component={JournalNavigator}
        options={{ title: "Journal", tabBarIcon: tabIcon(BookOpen) }}
      />
      <Tab.Screen
        name="SymptomesTab"
        component={SymptomesNavigator}
        options={{ title: "Symptômes", tabBarIcon: tabIcon(Activity) }}
      />
      <Tab.Screen
        name="RoutinesTab"
        component={RoutinesNavigator}
        options={{ title: "Routines", tabBarIcon: tabIcon(ListChecks) }}
      />
      <Tab.Screen
        name="PlusTab"
        component={PlusNavigator}
        options={{ title: "Plus", tabBarIcon: tabIcon(Menu) }}
      />
    </Tab.Navigator>
  );
}

function Splash() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.action} />
    </View>
  );
}

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Splash />;

  if (!session) {
    return (
      <AuthStack.Navigator screenOptions={stackOptions}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <ActiveChildProvider>
      <AuthedTabs />
    </ActiveChildProvider>
  );
}

function ThemedNavigation() {
  const c = useTheme();
  const scheme = useColorScheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: c.bg,
      card: c.card,
      text: c.text,
      border: c.border,
      primary: c.action,
    },
  };
  return (
    <NavigationContainer linking={linking} fallback={<Splash />} theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  // Load brand fonts in the background — do NOT gate rendering on them.
  useFonts({
    SourceSerif4_600SemiBold,
    SourceSerif4_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: DAY_MS,
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) =>
            Array.isArray(mutation.options.mutationKey) &&
            mutation.options.mutationKey[0] === "symptoms",
        },
      }}
      onSuccess={() => {
        void queryClient.resumePausedMutations();
      }}
    >
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <ThemedNavigation />
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  tabIcon: { fontSize: 20 },
});
