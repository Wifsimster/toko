import { useState } from "react";
import { Text, View } from "react-native";
import { z } from "zod";

import {
  AuthError,
  AuthField,
  AuthHeading,
  AuthLink,
  AuthPrimaryButton,
  AuthScaffold,
  useAuthStyles,
} from "../components/auth-form";
import { Mo } from "../components/mo/mo";
import { authClient } from "../lib/auth";
import { WEB_URL } from "../lib/config";
import type { ForgotPasswordProps } from "../navigation/types";

/**
 * Page web existante qui termine la réinitialisation (`?token=` ajouté par
 * l'API). Elle doit rester dans les `trustedOrigins` de l'API (APP_URL).
 */
const RESET_URL = `${WEB_URL}/reset-password`;

const emailSchema = z.string().email();

/**
 * « Mot de passe oublié » : l'app demande l'e-mail de réinitialisation, puis
 * le parent choisit son nouveau mot de passe sur le web. Le message affiché
 * ensuite est toujours le même, qu'un compte existe ou non (l'API répond pareil
 * dans les deux cas) : l'écran ne révèle pas qui a un compte.
 */
export function ForgotPasswordScreen({ navigation, route }: ForgotPasswordProps) {
  const { s } = useAuthStyles();
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    if (!emailSchema.safeParse(email.trim()).success) {
      setError("Saisissez une adresse e-mail valide, par exemple prenom@exemple.fr.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: RESET_URL,
      });
      if (resetError) {
        console.warn("[auth] password reset error", resetError.code ?? resetError.status);
        setError(
          resetError.status === 429
            ? "Trop de demandes d'affilée. Attendez une minute, puis réessayez."
            : "Envoi impossible pour le moment. Réessayez dans un moment.",
        );
        return;
      }
      setSent(true);
    } catch (e) {
      console.warn(
        "[auth] password reset threw",
        e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      );
      setError("Connexion impossible. Vérifiez votre connexion internet et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthScaffold>
        <View style={s.hero}>
          <Mo state="bravo" size={140} gesture="saut" />
        </View>
        <AuthHeading title="Regardez vos e-mails" />
        <Text style={s.body} accessibilityLiveRegion="polite">
          Si un compte existe pour cette adresse, un e‑mail vient de partir. Ouvrez le lien
          qu'il contient pour choisir un nouveau mot de passe. Pensez à regarder dans les spams.
        </Text>
        <AuthPrimaryButton label="Retour à la connexion" onPress={() => navigation.navigate("Login")} />
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold>
      <View style={s.hero}>
        <Mo state="calme" size={112} gesture="idee" />
      </View>

      <AuthHeading
        title="Mot de passe oublié"
        subtitle="Saisissez votre e-mail. Nous vous envoyons un lien pour en choisir un nouveau."
      />

      <View style={s.form}>
        <AuthField
          id="forgot-email"
          label="Adresse e-mail"
          placeholder="prenom@exemple.fr"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          inputMode="email"
          returnKeyType="send"
          onSubmitEditing={onSubmit}
          editable={!loading}
          value={email}
          onChangeText={setEmail}
        />

        <AuthError message={error} />

        <AuthPrimaryButton label="Envoyer le lien" onPress={onSubmit} loading={loading} />
      </View>

      <View style={s.footer}>
        <AuthLink
          label="Retour à la connexion"
          disabled={loading}
          onPress={() => navigation.navigate("Login")}
        />
      </View>
    </AuthScaffold>
  );
}
