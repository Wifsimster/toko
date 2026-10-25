import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleAlert, Eye, EyeOff } from "lucide-react-native";

import { BrandWordmark } from "../components/brand-wordmark";
import { Mo } from "../components/mo/mo";
import { fonts } from "../components/ui";
import { authClient } from "../lib/auth";
import { useTheme, type Palette } from "../lib/theme";

const EMAIL_ERROR = "Connexion impossible. Vérifiez votre e-mail et votre mot de passe.";
const GOOGLE_ERROR = "Connexion avec Google impossible. Réessayez dans un moment.";

/**
 * Connexion e-mail / mot de passe sur le backend Better Auth, plus « Continuer
 * avec Google » (même fournisseur que le web). Direction « Mō » : Mō dit
 * bonjour, une seule action principale (bouton encre), libellés visibles.
 */
export function LoginScreen() {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!email.trim() || !password) {
      setError("Saisissez votre e-mail et votre mot de passe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(EMAIL_ERROR);
      }
    } catch (e) {
      console.warn(
        "[auth] email sign-in threw",
        e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : String(e),
      );
      setError(EMAIL_ERROR);
    } finally {
      setLoading(false);
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
        console.warn("[auth] google sign-in error", JSON.stringify(socialError));
        setError(GOOGLE_ERROR);
      }
    } catch (e) {
      console.warn(
        "[auth] google sign-in threw",
        e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : String(e),
      );
      setError(GOOGLE_ERROR);
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        // Android en bord à bord (SDK 54) : la fenêtre ne se redimensionne
        // plus seule ; le padding remonte le formulaire au-dessus du clavier.
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.hero}>
              <View style={styles.moBox}>
                <Mo state="accueil" size={120} />
                <Text
                  style={styles.hello}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  bonjour !
                </Text>
              </View>
              <BrandWordmark width={104} color={c.text} />
            </View>

            <View style={styles.heading}>
              <Text style={styles.title} accessibilityRole="header">
                Bon retour
              </Text>
              <Text style={styles.subtitle}>
                Reprenez là où vous en étiez.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label} nativeID="login-email-label">
                  Adresse e-mail
                </Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Adresse e-mail"
                  accessibilityLabelledBy="login-email-label"
                  placeholder="prenom@exemple.fr"
                  placeholderTextColor={c.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                  keyboardType="email-address"
                  inputMode="email"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!busy}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label} nativeID="login-password-label">
                  Mot de passe
                </Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    ref={passwordRef}
                    style={[styles.input, styles.passwordInput]}
                    accessibilityLabel="Mot de passe"
                    accessibilityLabelledBy="login-password-label"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    textContentType="password"
                    importantForAutofill="yes"
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                    editable={!busy}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    style={styles.eye}
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={22} color={c.muted} />
                    ) : (
                      <Eye size={22} color={c.muted} />
                    )}
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View
                  style={styles.errorBox}
                  accessibilityLiveRegion="polite"
                  accessibilityRole="alert"
                >
                  <CircleAlert size={20} color={c.dangerFg} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
                onPress={onSubmit}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Se connecter"
                accessibilityState={{ disabled: busy, busy: loading }}
              >
                {loading ? (
                  <ActivityIndicator color={c.onPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </Pressable>

              <View
                style={styles.dividerRow}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
                onPress={onGoogle}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Continuer avec Google"
                accessibilityState={{ disabled: busy, busy: googleLoading }}
              >
                {googleLoading ? (
                  <ActivityIndicator color={c.text} />
                ) : (
                  <>
                    <Image
                      source={require("../../assets/google-g.png")}
                      style={styles.googleIcon}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                    <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 24 },
    content: { width: "100%", maxWidth: 420, alignSelf: "center", gap: 24 },
    hero: { alignItems: "center", gap: 2 },
    moBox: { width: 120, height: 120 },
    // Note manuscrite décorative (Caveat), jamais une information.
    hello: {
      position: "absolute",
      left: 108,
      top: 4,
      width: 90,
      fontFamily: fonts.hand,
      fontSize: 21,
      color: c.text,
      transform: [{ rotate: "-6deg" }],
    },
    heading: { alignItems: "center", gap: 8 },
    title: {
      fontFamily: fonts.heading,
      fontSize: 33,
      lineHeight: 37,
      letterSpacing: -0.8,
      color: c.text,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 16,
      lineHeight: 22,
      color: c.muted,
      textAlign: "center",
    },
    form: { gap: 16 },
    field: { gap: 6 },
    label: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: fonts.body,
      color: c.text,
      backgroundColor: c.card,
    },
    passwordRow: { justifyContent: "center" },
    passwordInput: { paddingRight: 56 },
    eye: {
      position: "absolute",
      right: 2,
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.dangerBorder,
      backgroundColor: c.dangerSurface,
    },
    errorIcon: { marginTop: 1 },
    errorText: {
      flex: 1,
      fontFamily: fonts.medium,
      fontSize: 15,
      lineHeight: 21,
      color: c.dangerFg,
    },
    button: {
      minHeight: 56,
      backgroundColor: c.primary,
      borderRadius: 16,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    buttonText: { color: c.onPrimary, fontSize: 17, fontFamily: fonts.bold },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.6 },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
    dividerText: { color: c.muted, fontSize: 14, fontFamily: fonts.medium },
    googleButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      borderRadius: 16,
      paddingHorizontal: 20,
    },
    googleIcon: { width: 20, height: 20 },
    googleButtonText: { color: c.text, fontSize: 16, fontFamily: fonts.semibold },
  });
