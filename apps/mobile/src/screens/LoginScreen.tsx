import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { authClient } from "../lib/auth";

/**
 * Minimal email/password sign-in against the existing Better Auth backend,
 * plus "Continue with Google" (same social provider as the web app).
 * One primary action per screen, per the ADHD-simple UX principles.
 */
export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Connexion impossible. Vérifie ton e-mail et ton mot de passe.");
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      // The Expo client opens an in-app browser for the OAuth flow and returns
      // to the app via the `toko://` scheme. Same Google provider as the web.
      // Requires the API's trustedOrigins to include `toko://` (server plugin).
      const { error: socialError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (socialError) {
        setError("Connexion avec Google impossible. Réessaie plus tard.");
      }
    } catch {
      setError("Connexion avec Google impossible. Réessaie plus tard.");
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/icon.png")}
        style={styles.logo}
        accessibilityLabel="Tokō"
      />
      <Text style={styles.title}>Se connecter à Tokō</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#71717a"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#71717a"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={onSubmit} disabled={busy}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={styles.googleButton}
        onPress={onGoogle}
        disabled={busy}
      >
        {googleLoading ? (
          <ActivityIndicator color="#18181b" />
        ) : (
          <>
            <Image
              source={require("../../assets/google-g.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#18181b",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e4e4e7" },
  dividerText: { color: "#71717a", fontSize: 14 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  googleIcon: { width: 20, height: 20 },
  googleButtonText: { color: "#18181b", fontSize: 16, fontWeight: "600" },
  error: { color: "#dc2626" },
});
