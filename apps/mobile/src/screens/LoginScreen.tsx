import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { authClient } from "../lib/auth";

/**
 * Minimal email/password sign-in against the existing Better Auth backend.
 * One primary action per screen, per the ADHD-simple UX principles.
 */
export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter à Tokō</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: "#dc2626" },
});
