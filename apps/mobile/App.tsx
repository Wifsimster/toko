import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";

import { authClient } from "./src/lib/auth";
import { queryClient } from "./src/lib/query";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";

function Root() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return session ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="auto" />
        <Root />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
