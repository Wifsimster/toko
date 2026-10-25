import { useRef, useState } from "react";
import { Text, View, type TextInput } from "react-native";
import { z } from "zod";

import {
  AuthCheckbox,
  AuthError,
  AuthField,
  AuthHeading,
  AuthLink,
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
import { authClient } from "../lib/auth";
import type { RegisterProps } from "../navigation/types";

/** Même minimum que l'API (`emailAndPassword.minPasswordLength`). */
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

const emailSchema = z.string().email();

const NETWORK_ERROR = "Connexion impossible. Vérifiez votre connexion internet et réessayez.";
const GENERIC_ERROR = "Inscription impossible pour le moment. Réessayez dans un moment.";

/** Traduit l'erreur Better Auth en une phrase qui dit quoi faire. */
function signUpErrorMessage(error: { code?: string; status?: number }): string {
  const code = error.code ?? "";
  if (code.startsWith("USER_ALREADY_EXISTS")) {
    return "Cette adresse a peut-être déjà un compte. Essayez de vous connecter, ou utilisez « Mot de passe oublié ? ».";
  }
  if (code === "PASSWORD_TOO_SHORT") return `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`;
  if (code === "PASSWORD_TOO_LONG") return `Le mot de passe doit faire au plus ${MAX_PASSWORD} caractères.`;
  if (code === "INVALID_EMAIL") return "Cette adresse e-mail n'est pas valide. Vérifiez-la.";
  if (error.status === 429) return "Trop d'essais d'affilée. Attendez une minute, puis réessayez.";
  return GENERIC_ERROR;
}

/**
 * Inscription e-mail / mot de passe, mêmes champs et même consentement que
 * le web (`apps/web/src/routes/register-form.tsx`). L'API enregistre les
 * consentements CGU et confidentialité à la création du compte, et envoie un
 * e-mail de confirmation sans le rendre obligatoire : le parent est connecté
 * tout de suite. Si un jour la vérification devient obligatoire (pas de
 * session renvoyée), l'écran « Vérifiez votre boîte mail » prend le relais.
 */
export function RegisterScreen({ navigation }: RegisterProps) {
  const { s } = useAuthStyles();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return "Saisissez votre prénom.";
    if (!emailSchema.safeParse(email.trim()).success) {
      return "Saisissez une adresse e-mail valide, par exemple prenom@exemple.fr.";
    }
    if (password.length < MIN_PASSWORD) {
      return `Choisissez un mot de passe d'au moins ${MIN_PASSWORD} caractères.`;
    }
    if (password.length > MAX_PASSWORD) {
      return `Le mot de passe doit faire au plus ${MAX_PASSWORD} caractères.`;
    }
    if (!consent) {
      return "Pour continuer, cochez la case\u00A0: vous avez 18 ans ou plus et acceptez les conditions et la politique de confidentialité.";
    }
    return null;
  }

  async function onSubmit() {
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (signUpError) {
        console.warn("[auth] sign-up error", signUpError.code ?? signUpError.status);
        setError(signUpErrorMessage(signUpError));
        return;
      }
      // Avec une session, `useSession` bascule seul vers l'app. Sans session
      // (vérification de l'e-mail exigée par l'API), on dit quoi faire.
      if (!data?.token) setSentTo(email.trim());
    } catch (e) {
      console.warn(
        "[auth] sign-up threw",
        e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      );
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <AuthScaffold>
        <View style={s.hero}>
          <Mo state="guide" size={140} />
        </View>
        <AuthHeading title="Vérifiez votre boîte mail" />
        <Text style={s.body}>
          Un lien vient de partir à <Text style={s.bodyStrong}>{sentTo}</Text>. Ouvrez-le pour
          activer votre compte, puis revenez vous connecter. Pensez à regarder dans les spams.
        </Text>
        <AuthPrimaryButton label="Retour à la connexion" onPress={() => navigation.navigate("Login")} />
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold>
      <View style={s.hero}>
        <Mo state="accueil" size={96} />
        <BrandWordmark width={88} />
      </View>

      <AuthHeading
        title="Créer un compte"
        subtitle="Pour noter le quotidien de votre enfant et voir, semaine après semaine, ce qui l'aide."
      />

      <View style={s.form}>
        <AuthField
          id="register-name"
          label="Prénom"
          placeholder="Votre prénom"
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!loading}
          value={name}
          onChangeText={setName}
        />
        <AuthField
          ref={emailRef}
          id="register-email"
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
          editable={!loading}
          value={email}
          onChangeText={setEmail}
        />
        <PasswordField
          ref={passwordRef}
          id="register-password"
          label="Mot de passe"
          hint={`${MIN_PASSWORD} caractères minimum.`}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          editable={!loading}
          value={password}
          onChangeText={setPassword}
        />

        <View>
          <AuthCheckbox
            checked={consent}
            onChange={setConsent}
            disabled={loading}
            label="J'ai 18 ans ou plus et j'accepte les conditions d'utilisation et la politique de confidentialité."
          />
          <View style={s.legalLinks}>
            <AuthLink
              label="Les conditions"
              a11yLabel="Lire les conditions d'utilisation"
              accessibilityRole="link"
              align="flex-start"
              onPress={() => openWebPage(TERMS_URL)}
            />
            <AuthLink
              label="La confidentialité"
              a11yLabel="Lire la politique de confidentialité"
              accessibilityRole="link"
              align="flex-start"
              onPress={() => openWebPage(PRIVACY_URL)}
            />
          </View>
        </View>

        <AuthError message={error} />

        <AuthPrimaryButton label="Créer mon compte" onPress={onSubmit} loading={loading} />
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Déjà un compte{" "}?</Text>
        <AuthLink label="Se connecter" disabled={loading} onPress={() => navigation.navigate("Login")} />
      </View>
    </AuthScaffold>
  );
}
