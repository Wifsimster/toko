import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { authClient } from "./src/lib/auth";
import { setupOnlineManager } from "./src/lib/online";
import { persister, queryClient } from "./src/lib/query";
import { linking } from "./src/navigation/linking";
import type { RootStackParamList } from "./src/navigation/types";
import { CalmMinutesScreen } from "./src/screens/CalmMinutesScreen";
import { ChildMenuScreen } from "./src/screens/ChildMenuScreen";
import { EveningCheckinScreen } from "./src/screens/EveningCheckinScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { JournalScreen } from "./src/screens/JournalScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RoutinesScreen } from "./src/screens/RoutinesScreen";

const DAY_MS = 1000 * 60 * 60 * 24;

// Pause/queue mutations offline and resume them on reconnect (NetInfo →
// React Query onlineManager). Set up once at module load.
setupOnlineManager();

const Stack = createNativeStackNavigator<RootStackParamList>();

function Splash() {
  return (
    <View style={styles.center}>
      <ActivityIndicator />
    </View>
  );
}

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Splash />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ChildMenu" component={ChildMenuScreen} />
          <Stack.Screen name="Checkin" component={EveningCheckinScreen} />
          <Stack.Screen name="CalmMinutes" component={CalmMinutesScreen} />
          <Stack.Screen name="Journal" component={JournalScreen} />
          <Stack.Screen name="Routines" component={RoutinesScreen} />
        </Stack.Group>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
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
        // survives an app restart and replays online. Other features
        // (journal…) still pause/resume within a session via onlineManager,
        // but aren't kept across a cold start.
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
