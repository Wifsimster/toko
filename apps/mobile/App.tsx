import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DefaultTheme,
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import { useEffect, useReducer, useState, type ComponentType, type ReactNode } from "react";
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
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { EmptyState, Loader, Screen, fonts, useTheme } from "./src/components/ui";
import { ActiveChildProvider, useActiveChild } from "./src/lib/active-child";
import { articles as articlesCopy, home as homeCopy, menuBar as menuBarCopy, sos as sosCopy } from "./src/lib/copy";
import { useUnseenArticleCount } from "./src/hooks/use-article-reads";
import { authClient } from "./src/lib/auth";
import { setupOnlineManager } from "./src/lib/online";
import { persister, queryClient } from "./src/lib/query";
import { companionLinking, linking, openedFromLinkOrNotification } from "./src/navigation/linking";
import {
  MobileTabsProvider,
  navigationRef,
  openSectionIn,
  useMobileTabs,
} from "./src/navigation/tabs";
import { SetupWizardProvider, useSetupWizard } from "./src/navigation/setup-wizard";
import { SetupWizardScreen } from "./src/screens/SetupWizardScreen";
import { SosTabButton } from "./src/components/sos/sos-tab-button";
import { SosOverlay } from "./src/components/sos/sos-overlay";
import { SOS_CLOSED, sosReducer } from "./src/lib/sos";
import { BarOverlapContext, SOS_BAR_OVERLAP } from "./src/lib/bar-overlap";
import type {
  ChildParams,
  RootStackParamList,
  RootTabParamList,
  CompanionTabParamList,
} from "./src/navigation/types";
import { navIcon } from "./src/navigation/nav-icons";
import {
  SOS_ROUTE,
  TAB_DEFS,
  bottomBar,
  hiddenTabRoutes,
  type MiddleTabRoute,
  type TabRoute,
} from "./src/navigation/nav-model";
import { MOBILE_TAB_IDS } from "@focusflow/validators";
import { COMPANION_MODE } from "./src/lib/config";
import { useReminderSync } from "./src/hooks/use-reminder-sync";
import { hideNativeSplash, holdNativeSplash } from "./src/lib/splash";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PauseScreen } from "./src/screens/PauseScreen";
import { GardenScreen } from "./src/screens/GardenScreen";
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
import { InsightsScreen } from "./src/screens/InsightsScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { BarkleyScreen } from "./src/screens/BarkleyScreen";
import { BarkleyStepScreen } from "./src/screens/BarkleyStepScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { CrisisListScreen } from "./src/screens/CrisisListScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { MenuBarScreen } from "./src/screens/MenuBarScreen";
import { ConnaissancesScreen } from "./src/screens/ConnaissancesScreen";
import { LexiqueScreen } from "./src/screens/LexiqueScreen";
import { ConnaissancesArticleScreen } from "./src/screens/ConnaissancesArticleScreen";
import { MoLoader } from "./src/components/mo/mo-loader";
import { BarLabel } from "./src/components/bar-label";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";

const DAY_MS = 1000 * 60 * 60 * 24;

setupOnlineManager();
holdNativeSplash();
if (!COMPANION_MODE) void openedFromLinkOrNotification();

const Tab = createBottomTabNavigator<RootTabParamList>();
const AccueilStack = createNativeStackNavigator<RootStackParamList>();
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
      <AccueilStack.Screen name="Pause" component={PauseScreen} />
      <AccueilStack.Screen name="Garden" component={GardenScreen} />
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

type ScreenProps = { route: { params?: object }; navigation: unknown };
type StackScreen = [keyof RootStackParamList, ComponentType<ScreenProps>];

const screen = (name: keyof RootStackParamList, component: ComponentType<never>): StackScreen => [
  name,
  component as unknown as ComponentType<ScreenProps>,
];

const SHARED_SCREENS: readonly StackScreen[] = [
  screen("Connaissances", ConnaissancesScreen),
  screen("ConnaissancesArticle", ConnaissancesArticleScreen),
  screen("Lexique", LexiqueScreen),
  screen("Journal", JournalScreen),
  screen("Symptoms", SymptomsScreen),
  screen("Checkin", EveningCheckinScreen),
  screen("SymptomForm", SymptomFormScreen),
  screen("Medications", MedicationsScreen),
  screen("Routines", RoutinesScreen),
  screen("AddRoutine", AddRoutineScreen),
  screen("EditRoutine", EditRoutineScreen),
  screen("Rewards", RewardsScreen),
  screen("Timer", TimerScreen),
  screen("CompanionCollection", CompanionCollectionScreen),
  screen("Insights", InsightsScreen),
  screen("CrisisList", CrisisListScreen),
  screen("Barkley", BarkleyScreen),
  screen("BarkleyStep", BarkleyStepScreen),
  screen("Report", ReportScreen),
  screen("Settings", SettingsScreen),
  screen("MenuBar", MenuBarScreen),
];

function withActiveChildRoot(Component: ComponentType<ScreenProps>): ComponentType<ScreenProps> {
  return function ActiveChildRoot(props: ScreenProps) {
    return (
      <WithActiveChild>
        {(p) => <Component key={p.childId} {...props} route={{ ...props.route, params: p }} />}
      </WithActiveChild>
    );
  };
}

function makeTabStack(root: keyof RootStackParamList, child: boolean, extra: readonly StackScreen[] = []) {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const screens = [...extra, ...SHARED_SCREENS].map(
    ([name, component]): StackScreen => [
      name,
      name === root && child ? withActiveChildRoot(component) : component,
    ],
  );
  return function TabStack() {
    return (
      <Stack.Navigator screenOptions={stackOptions} initialRouteName={root}>
        {screens.map(([name, component]) => (
          <Stack.Screen key={name} name={name} component={component as never} />
        ))}
      </Stack.Navigator>
    );
  };
}

function tabIcon(Icon: LucideIcon) {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon color={color} size={size} />
  );
}

function barLabel({
  color,
  children,
  position,
}: {
  color: string;
  children: string;
  position: "below-icon" | "beside-icon";
}) {
  return (
    <BarLabel color={color} position={position}>
      {children}
    </BarLabel>
  );
}

const MIDDLE_STACKS = {} as Record<MiddleTabRoute, ComponentType>;
for (const id of MOBILE_TAB_IDS) {
  MIDDLE_STACKS[TAB_DEFS[id].route] = makeTabStack(TAB_DEFS[id].root, TAB_DEFS[id].child);
}

function NoScreen() {
  return null;
}

const TAB_COMPONENTS: Record<TabRoute, ComponentType> = {
  ...MIDDLE_STACKS,
  AccueilTab: AccueilNavigator,
  SosTab: NoScreen,
  PlusTab: makeTabStack("PlusMenu", false, [screen("PlusMenu", PlusMenuScreen)]),
};

const HIDDEN_TAB = { tabBarButton: () => null, tabBarItemStyle: { display: "none" } } as const;

function AuthedTabs() {
  const c = useTheme();
  const { tabs, ready } = useMobileTabs();
  const wizard = useSetupWizard();
  const [sos, dispatchSos] = useReducer(sosReducer, SOS_CLOSED);
  const unseenArticles = useUnseenArticleCount();
  if (!ready) return <MoLoader />;
  const wizardOpen = wizard.mode !== null;
  const bar = bottomBar(tabs);
  const hidden = hiddenTabRoutes(tabs);
  const openCrisisList = (child: { id: string; name: string }) => {
    if (!navigationRef.isReady()) return;
    openSectionIn(
      navigationRef as unknown as { navigate: (route: string, params?: object) => void },
      tabs,
      "crisis",
      { childId: child.id, childName: child.name },
    );
  };
  const openSos = () => dispatchSos({ type: "open" });
  return (
    <View style={styles.flex}>
      <BarOverlapContext.Provider value={SOS_BAR_OVERLAP}>
        <View
          style={styles.flex}
          importantForAccessibility={wizardOpen ? "no-hide-descendants" : "auto"}
          accessibilityElementsHidden={wizardOpen}
        >
          <Tab.Navigator
            backBehavior="firstRoute"
            screenOptions={{
              headerShown: false,
              tabBarHideOnKeyboard: true,
              tabBarActiveTintColor: c.brandStrong,
              tabBarInactiveTintColor: c.muted,
              tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
            }}
          >
            {bar.map((tab, index) =>
              tab.route === SOS_ROUTE ? (
                <Tab.Screen
                  key={tab.route}
                  name={tab.route}
                  component={NoScreen}
                  options={{
                    title: tab.title,
                    tabBarButton: () => <SosTabButton onPress={openSos} />,
                    tabBarAccessibilityLabel: sosCopy.openLabel,
                  }}
                  listeners={{ tabPress: (e) => e.preventDefault() }}
                />
              ) : (
                <Tab.Screen
                  key={tab.route}
                  name={tab.route}
                  component={TAB_COMPONENTS[tab.route]}
                  options={{
                    title: tab.title,
                    tabBarIcon: tabIcon(navIcon(tab.icon)),
                    tabBarLabel: barLabel,
                    tabBarAccessibilityLabel:
                      tab.route === "ArticlesTab" && unseenArticles > 0
                        ? `${menuBarCopy.tabLabel(tab.title, index + 1, bar.length)}, ${articlesCopy.unseenCount(unseenArticles)}`
                        : menuBarCopy.tabLabel(tab.title, index + 1, bar.length),
                    ...(tab.route === "ArticlesTab" && unseenArticles > 0
                      ? {
                          tabBarBadge: unseenArticles > 9 ? "9+" : unseenArticles,
                          tabBarBadgeStyle: { backgroundColor: `${c.brand}26`, color: c.brandStrong, fontFamily: fonts.semibold },
                        }
                      : {}),
                  }}
                />
              ),
            )}
            {hidden.map((route) => (
              <Tab.Screen key={route} name={route} component={TAB_COMPONENTS[route]} options={HIDDEN_TAB} />
            ))}
          </Tab.Navigator>
          <SosOverlay state={sos} dispatch={dispatchSos} onEditList={openCrisisList} />
        </View>
      </BarOverlapContext.Provider>
      {wizardOpen ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]}>
          <SetupWizardScreen onClose={wizard.finish} />
        </View>
      ) : null}
    </View>
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
          <SetupWizardProvider>
            <AuthedTabs />
          </SetupWizardProvider>
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
    <NavigationContainer ref={navigationRef} linking={activeLinking} theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useFonts({
    SourceSerif4_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_400Regular_Italic,
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
