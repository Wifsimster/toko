import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "./src/components/ui";
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
// Suivi
import { SuiviMenuScreen } from "./src/screens/SuiviMenuScreen";
import { EveningCheckinScreen } from "./src/screens/EveningCheckinScreen";
import { SymptomsScreen } from "./src/screens/SymptomsScreen";
import { MedicationsScreen } from "./src/screens/MedicationsScreen";
import { JournalScreen } from "./src/screens/JournalScreen";
import { CalmMinutesScreen } from "./src/screens/CalmMinutesScreen";
import { InsightsScreen } from "./src/screens/InsightsScreen";
import { ActivityScreen } from "./src/screens/ActivityScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
// Programme
import { ProgrammeMenuScreen } from "./src/screens/ProgrammeMenuScreen";
import { RoutinesScreen } from "./src/screens/RoutinesScreen";
import { BarkleyScreen } from "./src/screens/BarkleyScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { DecodeurScreen } from "./src/screens/DecodeurScreen";
import { ScriptsScreen } from "./src/screens/ScriptsScreen";
import { StrengthsScreen } from "./src/screens/StrengthsScreen";
import { CrisisListScreen } from "./src/screens/CrisisListScreen";
import { CarePathwayScreen } from "./src/screens/CarePathwayScreen";
import { AchievementsScreen } from "./src/screens/AchievementsScreen";
// Compte
import { CompteScreen } from "./src/screens/CompteScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { BurnoutScreen } from "./src/screens/BurnoutScreen";
import { ConnaissancesScreen } from "./src/screens/ConnaissancesScreen";
// Auth
import { LoginScreen } from "./src/screens/LoginScreen";

const DAY_MS = 1000 * 60 * 60 * 24;

// Pause/queue mutations offline and resume them on reconnect (NetInfo →
// React Query onlineManager). Set up once at module load.
setupOnlineManager();

const Tab = createBottomTabNavigator<RootTabParamList>();
const AccueilStack = createNativeStackNavigator<RootStackParamList>();
const SuiviStack = createNativeStackNavigator<RootStackParamList>();
const ProgrammeStack = createNativeStackNavigator<RootStackParamList>();
const CompteStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<RootStackParamList>();

const stackOptions = { headerShown: false } as const;

function AccueilNavigator() {
  return (
    <AccueilStack.Navigator screenOptions={stackOptions}>
      <AccueilStack.Screen name="Home" component={HomeScreen} />
    </AccueilStack.Navigator>
  );
}

function SuiviNavigator() {
  return (
    <SuiviStack.Navigator screenOptions={stackOptions}>
      <SuiviStack.Screen name="SuiviMenu" component={SuiviMenuScreen} />
      <SuiviStack.Screen name="Checkin" component={EveningCheckinScreen} />
      <SuiviStack.Screen name="Symptoms" component={SymptomsScreen} />
      <SuiviStack.Screen name="Medications" component={MedicationsScreen} />
      <SuiviStack.Screen name="Journal" component={JournalScreen} />
      <SuiviStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
      <SuiviStack.Screen name="Insights" component={InsightsScreen} />
      <SuiviStack.Screen name="Activity" component={ActivityScreen} />
      <SuiviStack.Screen name="Report" component={ReportScreen} />
    </SuiviStack.Navigator>
  );
}

function ProgrammeNavigator() {
  return (
    <ProgrammeStack.Navigator screenOptions={stackOptions}>
      <ProgrammeStack.Screen name="ProgrammeMenu" component={ProgrammeMenuScreen} />
      <ProgrammeStack.Screen name="Routines" component={RoutinesScreen} />
      <ProgrammeStack.Screen name="Barkley" component={BarkleyScreen} />
      <ProgrammeStack.Screen name="Rewards" component={RewardsScreen} />
      <ProgrammeStack.Screen name="Decodeur" component={DecodeurScreen} />
      <ProgrammeStack.Screen name="Scripts" component={ScriptsScreen} />
      <ProgrammeStack.Screen name="Strengths" component={StrengthsScreen} />
      <ProgrammeStack.Screen name="CrisisList" component={CrisisListScreen} />
      <ProgrammeStack.Screen name="CarePathway" component={CarePathwayScreen} />
      <ProgrammeStack.Screen name="Achievements" component={AchievementsScreen} />
    </ProgrammeStack.Navigator>
  );
}

function CompteNavigator() {
  return (
    <CompteStack.Navigator screenOptions={stackOptions}>
      <CompteStack.Screen name="Compte" component={CompteScreen} />
      <CompteStack.Screen name="Settings" component={SettingsScreen} />
      <CompteStack.Screen name="Burnout" component={BurnoutScreen} />
      <CompteStack.Screen name="Connaissances" component={ConnaissancesScreen} />
    </CompteStack.Navigator>
  );
}

function tabIcon(emoji: string) {
  return () => <Text style={styles.tabIcon}>{emoji}</Text>;
}

function AuthedTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="AccueilTab"
        component={AccueilNavigator}
        options={{ title: "Accueil", tabBarIcon: tabIcon("🏠") }}
      />
      <Tab.Screen
        name="SuiviTab"
        component={SuiviNavigator}
        options={{ title: "Suivi", tabBarIcon: tabIcon("📊") }}
      />
      <Tab.Screen
        name="ProgrammeTab"
        component={ProgrammeNavigator}
        options={{ title: "Programme", tabBarIcon: tabIcon("🎯") }}
      />
      <Tab.Screen
        name="CompteTab"
        component={CompteNavigator}
        options={{ title: "Compte", tabBarIcon: tabIcon("👤") }}
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

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: DAY_MS,
        // Persist only the evening check-in's paused (offline) mutations so it
        // survives an app restart and replays online.
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
        <NavigationContainer linking={linking} fallback={<Splash />}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tabIcon: { fontSize: 20 },
});
