import { BottomTabBar, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DefaultTheme,
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Sun,
  Moon,
  Timer as TimerIcon,
  type LucideIcon,
} from "lucide-react-native";
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
import { navigationRef } from "./src/navigation/tabs";
import { SosButton } from "./src/components/sos/sos-button";
import { FLOATING_BUTTON_GAP, FLOATING_INSET, FloatingInsetContext } from "./src/lib/floating-inset";
import type {
  BarkleyProps,
  ChildParams,
  RootStackParamList,
  RootTabParamList,
  CompanionTabParamList,
} from "./src/navigation/types";
import { navIcon } from "./src/navigation/nav-icons";
import { bottomBar, type TabRoute } from "./src/navigation/nav-model";
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
import { SuiviHubScreen } from "./src/screens/SuiviHubScreen";
import { ConnaissancesScreen } from "./src/screens/ConnaissancesScreen";
import { LexiqueScreen } from "./src/screens/LexiqueScreen";
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
const BarkleyStack = createNativeStackNavigator<RootStackParamList>();
const SuiviStack = createNativeStackNavigator<RootStackParamList>();
const CompteStack = createNativeStackNavigator<RootStackParamList>();
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

function BarkleyTabRoot(props: BarkleyProps) {
  return (
    <WithActiveChild>
      {(p) => <BarkleyScreen key={p.childId} {...props} route={{ ...props.route, params: p }} />}
    </WithActiveChild>
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

function SuiviNavigator() {
  return (
    <SuiviStack.Navigator screenOptions={stackOptions}>
      <SuiviStack.Screen name="SuiviHub" component={SuiviHubScreen} />
      <SuiviStack.Screen name="Connaissances" component={ConnaissancesScreen} />
      <SuiviStack.Screen
        name="ConnaissancesArticle"
        component={ConnaissancesArticleScreen}
      />
      <SuiviStack.Screen name="Lexique" component={LexiqueScreen} />
      <SuiviStack.Screen name="Journal" component={JournalScreen} />
      <SuiviStack.Screen name="Symptoms" component={SymptomsScreen} />
      <SuiviStack.Screen name="Checkin" component={EveningCheckinScreen} />
      <SuiviStack.Screen name="SymptomForm" component={SymptomFormScreen} />
      <SuiviStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
      <SuiviStack.Screen name="Medications" component={MedicationsScreen} />
      <SuiviStack.Screen name="Routines" component={RoutinesScreen} />
      <SuiviStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <SuiviStack.Screen name="EditRoutine" component={EditRoutineScreen} />
      <SuiviStack.Screen name="Rewards" component={RewardsScreen} />
      <SuiviStack.Screen name="Timer" component={TimerScreen} />
      <SuiviStack.Screen
        name="CompanionCollection"
        component={CompanionCollectionScreen}
      />
      <SuiviStack.Screen name="Insights" component={InsightsScreen} />
      <SuiviStack.Screen name="CrisisList" component={CrisisListScreen} />
    </SuiviStack.Navigator>
  );
}

function CompteNavigator() {
  return (
    <CompteStack.Navigator screenOptions={stackOptions}>
      <CompteStack.Screen name="Settings" component={SettingsScreen} />
    </CompteStack.Navigator>
  );
}

function PlusNavigator() {
  return (
    <PlusStack.Navigator screenOptions={stackOptions}>
      <PlusStack.Screen name="PlusMenu" component={PlusMenuScreen} />
      <PlusStack.Screen name="Report" component={ReportScreen} />
      <PlusStack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
    </PlusStack.Navigator>
  );
}

function tabIcon(Icon: LucideIcon) {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
}

const TAB_COMPONENTS: Record<TabRoute, ComponentType> = {
  AccueilTab: AccueilNavigator,
  SuiviTab: SuiviNavigator,
  BarkleyTab: BarkleyNavigator,
  CompteTab: CompteNavigator,
  PlusTab: PlusNavigator,
};

const BOTTOM_BAR = bottomBar();

function AuthedTabs() {
  const c = useTheme();
  const [barHeight, setBarHeight] = useState(0);
  const openCrisisList = (child: { id: string; name: string }) => {
    if (!navigationRef.isReady()) return;
    navigationRef.navigate("SuiviTab", {
      screen: "CrisisList",
      params: { childId: child.id, childName: child.name },
      initial: false,
    });
  };
  return (
    <FloatingInsetContext.Provider value={FLOATING_INSET}>
      <View style={styles.flex}>
        <Tab.Navigator
          backBehavior="firstRoute"
          tabBar={(props) => (
            <View onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}>
              <BottomTabBar {...props} />
            </View>
          )}
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: c.brandStrong,
            tabBarInactiveTintColor: c.muted,
            tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
            tabBarLabelStyle: { fontFamily: fonts.medium },
          }}
        >
          {BOTTOM_BAR.map((tab) => (
            <Tab.Screen
              key={tab.route}
              name={tab.route}
              component={TAB_COMPONENTS[tab.route]}
              options={{ title: tab.title, tabBarIcon: tabIcon(navIcon(tab.icon)) }}
            />
          ))}
        </Tab.Navigator>
        {barHeight > 0 ? <SosButton bottom={barHeight + FLOATING_BUTTON_GAP} onEditList={openCrisisList} /> : null}
      </View>
    </FloatingInsetContext.Provider>
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
        <AuthedTabs />
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
    <NavigationContainer ref={navigationRef} linking={activeLinking} theme={navTheme}>
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
