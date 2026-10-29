import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DefaultTheme,
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Sun,
  Moon,
  Timer as TimerIcon,
  type LucideIcon,
} from "lucide-react-native";
import type { MobileTabId } from "@focusflow/validators";
import { useFonts } from "expo-font";
import { SourceSerif4_600SemiBold } from "@expo-google-fonts/source-serif-4";
import { Caveat_600SemiBold } from "@expo-google-fonts/caveat";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { EmptyState, Loader, Screen, fonts, useTheme } from "./src/components/ui";
import { ActiveChildProvider, useActiveChild } from "./src/lib/active-child";
import { home as homeCopy } from "./src/lib/copy";
import { authClient } from "./src/lib/auth";
import { setupOnlineManager } from "./src/lib/online";
import { persister, queryClient } from "./src/lib/query";
import { companionLinking, linking } from "./src/navigation/linking";
import type {
  BarkleyProps,
  CalmMinutesProps,
  ChildParams,
  CrisisListProps,
  InsightsProps,
  MedicationsProps,
  ReportProps,
  RewardsProps,
  RootStackParamList,
  RootTabParamList,
  CompanionTabParamList,
} from "./src/navigation/types";
import {
  FIXED_TABS,
  MOBILE_TABS,
  MobileTabsProvider,
  useMobileTabs,
} from "./src/navigation/tabs";
import { COMPANION_MODE } from "./src/lib/config";
import { useReminderSync } from "./src/hooks/use-reminder-sync";
import { hideNativeSplash, holdNativeSplash } from "./src/lib/splash";
import { HomeScreen } from "./src/screens/HomeScreen";
import { JournalScreen } from "./src/screens/JournalScreen";
import { SymptomsScreen } from "./src/screens/SymptomsScreen";
import { SymptomFormScreen } from "./src/screens/SymptomFormScreen";
import { EveningCheckinScreen } from "./src/screens/EveningCheckinScreen";
import { RoutinesScreen } from "./src/screens/RoutinesScreen";
import { AddRoutineScreen } from "./src/screens/AddRoutineScreen";
import { EditRoutineScreen } from "./src/screens/EditRoutineScreen";
import { PlusMenuScreen } from "./src/screens/PlusMenuScreen";
import { TimerScreen } from "./src/screens/TimerScreen";
import { CompanionCollectionScreen } from "./src/screens/CompanionCollectionScreen";
import { MedicationsScreen } from "./src/screens/MedicationsScreen";
import { CalmMinutesScreen } from "./src/screens/CalmMinutesScreen";
import { InsightsScreen } from "./src/screens/InsightsScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { BarkleyScreen } from "./src/screens/BarkleyScreen";
import { BarkleyStepScreen } from "./src/screens/BarkleyStepScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { CrisisListScreen } from "./src/screens/CrisisListScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { MenuBarScreen } from "./src/screens/MenuBarScreen";
import { ConnaissancesScreen } from "./src/screens/ConnaissancesScreen";
import { ConnaissancesArticleScreen } from "./src/screens/ConnaissancesArticleScreen";
import { MoLoader } from "./src/components/mo/mo-loader";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";

const DAY_MS = 1000 * 60 * 60 * 24;

setupOnlineManager();
holdNativeSplash();

const Tab = createBottomTabNavigator<RootTabParamList>();
const AccueilStack = createNativeStackNavigator<RootStackParamList>();
const ArticlesStack = createNativeStackNavigator<RootStackParamList>();
const RoutinesStack = createNativeStackNavigator<RootStackParamList>();
const MinuteurStack = createNativeStackNavigator<RootStackParamList>();
const JournalStack = createNativeStackNavigator<RootStackParamList>();
const SymptomesStack = createNativeStackNavigator<RootStackParamList>();
const MedicamentsStack = createNativeStackNavigator<RootStackParamList>();
const BarkleyStack = createNativeStackNavigator<RootStackParamList>();
const CalmeStack = createNativeStackNavigator<RootStackParamList>();
const InsightsStack = createNativeStackNavigator<RootStackParamList>();
const RapportStack = createNativeStackNavigator<RootStackParamList>();
const CriseStack = createNativeStackNavigator<RootStackParamList>();
const RecompensesStack = createNativeStackNavigator<RootStackParamList>();
const PlusStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<RootStackParamList>();

const CompanionTab = createBottomTabNavigator<CompanionTabParamList>();
const MatinStack = createNativeStackNavigator<RootStackParamList>();
const SoirStack = createNativeStackNavigator<RootStackParamList>();
const TimerTabStack = createNativeStackNavigator<RootStackParamList>();

const stackOptions = { headerShown: false } as const;

function AccueilNavigator() {
  return (
    <AccueilStack.Navigator screenOptions={stackOptions}>
      <AccueilStack.Screen name="Home" component={HomeScreen} />
      <AccueilStack.Screen name="Checkin" component={EveningCheckinScreen} />
      <AccueilStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
    </AccueilStack.Navigator>
  );
}

function ArticlesNavigator() {
  return (
    <ArticlesStack.Navigator screenOptions={stackOptions}>
      <ArticlesStack.Screen name="Connaissances" component={ConnaissancesScreen} />
      <ArticlesStack.Screen
        name="ConnaissancesArticle"
        component={ConnaissancesArticleScreen}
      />
    </ArticlesStack.Navigator>
  );
}

function MinuteurNavigator() {
  return (
    <MinuteurStack.Navigator screenOptions={stackOptions}>
      <MinuteurStack.Screen name="Timer" component={TimerScreen} />
      <MinuteurStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
    </MinuteurStack.Navigator>
  );
}

function WithActiveChild({ children }: { children: (child: ChildParams) => ReactNode }) {
  const { active, isLoading } = useActiveChild();
  if (isLoading) {
    return (
      <Screen>
        <Loader />
      </Screen>
    );
  }
  if (!active) {
    return (
      <Screen>
        <EmptyState mo title={homeCopy.noChildTitle} body={homeCopy.noChildBody} />
      </Screen>
    );
  }
  return <>{children({ childId: active.id, childName: active.name })}</>;
}

function MedicationsTabRoot(props: MedicationsProps) {
  return (
    <WithActiveChild>
      {(p) => <MedicationsScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function BarkleyTabRoot(props: BarkleyProps) {
  return (
    <WithActiveChild>
      {(p) => <BarkleyScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function CalmMinutesTabRoot(props: CalmMinutesProps) {
  return (
    <WithActiveChild>
      {(p) => <CalmMinutesScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function InsightsTabRoot(props: InsightsProps) {
  return (
    <WithActiveChild>
      {(p) => <InsightsScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function ReportTabRoot(props: ReportProps) {
  return (
    <WithActiveChild>
      {(p) => <ReportScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function CrisisListTabRoot(props: CrisisListProps) {
  return (
    <WithActiveChild>
      {(p) => <CrisisListScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function RewardsTabRoot(props: RewardsProps) {
  return (
    <WithActiveChild>
      {(p) => <RewardsScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
  );
}

function MedicamentsNavigator() {
  return (
    <MedicamentsStack.Navigator screenOptions={stackOptions}>
      <MedicamentsStack.Screen name="Medications" component={MedicationsTabRoot} />
    </MedicamentsStack.Navigator>
  );
}

function BarkleyNavigator() {
  return (
    <BarkleyStack.Navigator screenOptions={stackOptions}>
      <BarkleyStack.Screen name="Barkley" component={BarkleyTabRoot} />
      <BarkleyStack.Screen name="BarkleyStep" component={BarkleyStepScreen} />
    </BarkleyStack.Navigator>
  );
}

function CalmeNavigator() {
  return (
    <CalmeStack.Navigator screenOptions={stackOptions}>
      <CalmeStack.Screen name="CalmMinutes" component={CalmMinutesTabRoot} />
    </CalmeStack.Navigator>
  );
}

function InsightsNavigator() {
  return (
    <InsightsStack.Navigator screenOptions={stackOptions}>
      <InsightsStack.Screen name="Insights" component={InsightsTabRoot} />
    </InsightsStack.Navigator>
  );
}

function RapportNavigator() {
  return (
    <RapportStack.Navigator screenOptions={stackOptions}>
      <RapportStack.Screen name="Report" component={ReportTabRoot} />
    </RapportStack.Navigator>
  );
}

function CriseNavigator() {
  return (
    <CriseStack.Navigator screenOptions={stackOptions}>
      <CriseStack.Screen name="CrisisList" component={CrisisListTabRoot} />
    </CriseStack.Navigator>
  );
}

function RecompensesNavigator() {
  return (
    <RecompensesStack.Navigator screenOptions={stackOptions}>
      <RecompensesStack.Screen name="Rewards" component={RewardsTabRoot} />
    </RecompensesStack.Navigator>
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
      <SymptomesStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
    </SymptomesStack.Navigator>
  );
}

function RoutinesNavigator() {
  return (
    <RoutinesStack.Navigator screenOptions={stackOptions}>
      <RoutinesStack.Screen name="Routines" component={RoutinesScreen} />
      <RoutinesStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <RoutinesStack.Screen name="EditRoutine" component={EditRoutineScreen} />
      <RoutinesStack.Screen name="Timer" component={TimerScreen} />
      <RoutinesStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
    </RoutinesStack.Navigator>
  );
}

function PlusNavigator() {
  return (
    <PlusStack.Navigator screenOptions={stackOptions}>
      <PlusStack.Screen name="PlusMenu" component={PlusMenuScreen} />
      <PlusStack.Screen name="Journal" component={JournalScreen} />
      <PlusStack.Screen name="Symptoms" component={SymptomsScreen} />
      <PlusStack.Screen name="Checkin" component={EveningCheckinScreen} />
      <PlusStack.Screen name="SymptomForm" component={SymptomFormScreen} />
      <PlusStack.Screen name="Routines" component={RoutinesScreen} />
      <PlusStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <PlusStack.Screen name="EditRoutine" component={EditRoutineScreen} />
      <PlusStack.Screen name="Timer" component={TimerScreen} />
      <PlusStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
      <PlusStack.Screen name="Medications" component={MedicationsScreen} />
      <PlusStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
      <PlusStack.Screen name="Insights" component={InsightsScreen} />
      <PlusStack.Screen name="Report" component={ReportScreen} />
      <PlusStack.Screen name="Barkley" component={BarkleyScreen} />
      <PlusStack.Screen name="BarkleyStep" component={BarkleyStepScreen} />
      <PlusStack.Screen name="Rewards" component={RewardsScreen} />
      <PlusStack.Screen name="CrisisList" component={CrisisListScreen} />
      <PlusStack.Screen name="Settings" component={SettingsScreen} />
      <PlusStack.Screen name="MenuBar" component={MenuBarScreen} />
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

const MIDDLE_NAVIGATORS: Record<MobileTabId, ComponentType> = {
  articles: ArticlesNavigator,
  routines: RoutinesNavigator,
  timer: MinuteurNavigator,
  journal: JournalNavigator,
  symptoms: SymptomesNavigator,
  medications: MedicamentsNavigator,
  barkley: BarkleyNavigator,
  calm: CalmeNavigator,
  insights: InsightsNavigator,
  report: RapportNavigator,
  crisis: CriseNavigator,
  rewards: RecompensesNavigator,
};

function AuthedTabs() {
  const c = useTheme();
  const { tabs, ready } = useMobileTabs();
  if (!ready) return <MoLoader />;
  return (
    <Tab.Navigator
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.brandStrong,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarLabelStyle: { fontFamily: fonts.medium },
      }}
    >
      <Tab.Screen
        name="AccueilTab"
        component={AccueilNavigator}
        options={{ title: FIXED_TABS.first.label, tabBarIcon: tabIcon(FIXED_TABS.first.icon) }}
      />
      {tabs.map((id) => (
        <Tab.Screen
          key={id}
          name={MOBILE_TABS[id].route}
          component={MIDDLE_NAVIGATORS[id]}
          options={{ title: MOBILE_TABS[id].label, tabBarIcon: tabIcon(MOBILE_TABS[id].icon) }}
        />
      ))}
      <Tab.Screen
        name="PlusTab"
        component={PlusNavigator}
        options={{ title: FIXED_TABS.last.label, tabBarIcon: tabIcon(FIXED_TABS.last.icon) }}
      />
    </Tab.Navigator>
  );
}

function MatinNavigator() {
  return (
    <MatinStack.Navigator screenOptions={stackOptions}>
      <MatinStack.Screen
        name="Routines"
        component={RoutinesScreen}
        initialParams={{ slot: "morning" }}
      />
      <MatinStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <MatinStack.Screen name="EditRoutine" component={EditRoutineScreen} />
      <MatinStack.Screen name="Timer" component={TimerScreen} />
      <MatinStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
    </MatinStack.Navigator>
  );
}

function SoirNavigator() {
  return (
    <SoirStack.Navigator screenOptions={stackOptions}>
      <SoirStack.Screen
        name="Routines"
        component={RoutinesScreen}
        initialParams={{ slot: "evening" }}
      />
      <SoirStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <SoirStack.Screen name="EditRoutine" component={EditRoutineScreen} />
      <SoirStack.Screen name="Timer" component={TimerScreen} />
      <SoirStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
    </SoirStack.Navigator>
  );
}

function TimerNavigator() {
  return (
    <TimerTabStack.Navigator screenOptions={stackOptions}>
      <TimerTabStack.Screen name="Timer" component={TimerScreen} />
      <TimerTabStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
    </TimerTabStack.Navigator>
  );
}

function CompanionTabs() {
  const c = useTheme();
  return (
    <CompanionTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.brandStrong,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarLabelStyle: { fontFamily: fonts.medium },
      }}
    >
      <CompanionTab.Screen
        name="MatinTab"
        component={MatinNavigator}
        options={{ title: "Matin", tabBarIcon: tabIcon(Sun) }}
      />
      <CompanionTab.Screen
        name="SoirTab"
        component={SoirNavigator}
        options={{ title: "Soir", tabBarIcon: tabIcon(Moon) }}
      />
      <CompanionTab.Screen
        name="TimerTab"
        component={TimerNavigator}
        options={{ title: "Timer", tabBarIcon: tabIcon(TimerIcon) }}
      />
    </CompanionTab.Navigator>
  );
}

function ReminderSync() {
  useReminderSync();
  return null;
}

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();
  const [loaded, setLoaded] = useState(false);
  if (!isPending && !loaded) setLoaded(true);
  useEffect(() => {
    if (loaded) hideNativeSplash();
  }, [loaded]);

  if (!loaded) return <MoLoader />;

  if (!session) {
    return (
      <AuthStack.Navigator screenOptions={stackOptions}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <ActiveChildProvider>
      <ReminderSync />
      {COMPANION_MODE ? (
        <CompanionTabs />
      ) : (
        <MobileTabsProvider>
          <AuthedTabs />
        </MobileTabsProvider>
      )}
    </ActiveChildProvider>
  );
}

function ThemedNavigation() {
  const c = useTheme();
  const base = DefaultTheme;
  const activeLinking = (
    COMPANION_MODE ? companionLinking : linking
  ) as LinkingOptions<RootTabParamList>;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: c.bg,
      card: c.card,
      text: c.text,
      border: c.border,
      primary: c.brandStrong,
    },
  };
  return (
    <NavigationContainer linking={activeLinking} theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useFonts({
    SourceSerif4_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Caveat_600SemiBold,
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
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ThemedNavigation />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
