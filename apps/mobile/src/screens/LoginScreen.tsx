import { useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View, type TextInput } from "react-native";

import {
  AuthError,
  AuthField,
  AuthHeading,
  AuthLink,
  AuthNotice,
  AuthPrimaryButton,
  AuthScaffold,
  PasswordField,
  PRIVACY_URL,
  TERMS_URL,
  openWebPage,
  useAuthStyles,
} from "../components/auth-form";
import { BrandWordmark } from "../components/brand-wordmark";
import { Mo } from "../components/mo/mo";
import { ResendVerification } from "../components/resend-verification";
import { fonts } from "../components/ui";
import { authClient, preferChromeForOAuth } from "../lib/auth";
import type { LoginProps } from "../navigation/types";

const EMAIL_ERROR = "Connexion impossible. Vérifiez votre e-mail et votre mot de passe.";
const GOOGLE_ERROR = "Connexion avec Google impossible. Réessayez dans un moment.";
const UNVERIFIED_ERROR =
  "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le lien reçu par e-mail, ou renvoyez-le ci-dessous.";

/**
 * Connexion e-mail / mot de passe sur le backend Better Auth, plus « Continuer
 * avec Google » (même fournisseur que le web). Direction « Mō » : Mō dit
 * bonjour, une seule action principale (bouton encre), libellés visibles.
 * Liens vers « Mot de passe oublié » et « Créer un compte ».
 */
export function LoginScreen({ navigation }: LoginProps) {
  const { c, s } = useAuthStyles();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Adresse dont le mot de passe était bon mais pas encore confirmée : on
  // propose « Renvoyer l'e-mail » sous le message.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function onSubmit() {
    if (!email.trim() || !password) {
      setError("Saisissez votre e-mail et votre mot de passe.");
      return;
    }
    setLoading(true);
    setError(null);
    setUnverifiedEmail(null);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (signInError) {
        // EMAIL_NOT_VERIFIED n'arrive qu'après un mot de passe correct : le
        // dire ne révèle rien à qui ne le connaît pas.
        if (signInError.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email.trim());
          setError(UNVERIFIED_ERROR);
        } else {
          setError(EMAIL_ERROR);
        }
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
      // On Android the tab opens in Chrome when installed: Brave's tab never
      // hands `toko://` back to the app.
      await preferChromeForOAuth();
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
    <AuthScaffold>
      <View style={s.hero}>
        <View style={styles.moBox}>
          <Mo state="accueil" size={120} wave />
          <Text
            style={[styles.hello, { color: c.text }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            bonjour !
          </Text>
        </View>
        <BrandWordmark width={104} color={c.text} />
      </View>

      <AuthHeading title="Bon retour" subtitle="Reprenez là où vous en étiez." />

      <View style={s.form}>
        <AuthField
          id="login-email"
          label="Adresse e-mail"
          placeholder="prenom@exemple.fr"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          inputMode="email"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
          value={email}
          onChangeText={setEmail}
        />

        <View>
          <PasswordField
            ref={passwordRef}
            id="login-password"
            label="Mot de passe"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            editable={!busy}
            value={password}
            onChangeText={setPassword}
          />
          <AuthLink
            label={"Mot de passe oublié ?"}
            align="flex-end"
            disabled={busy}
            onPress={() =>
              navigation.navigate("ForgotPassword", { email: email.trim() || undefined })
            }
          />
        </View>

        <AuthError message={error} />
        {unverifiedEmail ? <ResendVerification email={unverifiedEmail} /> : null}

        <AuthPrimaryButton label="Se connecter" onPress={onSubmit} loading={loading} disabled={busy} />

        <View
          style={styles.dividerRow}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          <Text style={[styles.dividerText, { color: c.muted }]}>ou</Text>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            { borderColor: c.border, backgroundColor: c.card },
            pressed && s.pressed,
            busy && s.disabled,
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
              <Text style={[styles.googleButtonText, { color: c.text }]}>
                Continuer avec Google
              </Text>
            </>
          )}
        </Pressable>

        {/* Comme sur le web : un nouveau compte Google enregistre aussi le
            consentement aux CGU et à la confidentialité (hook d'inscription). */}
        <AuthNotice
          parts={[
            "En continuant avec Google, vous acceptez nos",
            { link: "conditions d'utilisation", onPress: () => openWebPage(TERMS_URL) },
            "et notre",
            { link: "politique de confidentialité", after: ".", onPress: () => openWebPage(PRIVACY_URL) },
          ]}
        />
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Pas encore de compte{" "}?</Text>
        <AuthLink
          label="Créer un compte"
          disabled={busy}
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  moBox: { width: 120, height: 120 },
  // Note manuscrite décorative (Caveat), jamais une information.
  hello: {
    position: "absolute",
    left: 108,
    top: 4,
    width: 90,
    fontFamily: fonts.hand,
    fontSize: 21,
    transform: [{ rotate: "-6deg" }],
  },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 14, fontFamily: fonts.medium },
  googleButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  googleIcon: { width: 20, height: 20 },
  googleButtonText: { fontSize: 16, fontFamily: fonts.semibold },
});
