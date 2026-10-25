import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { AuthLink, useAuthStyles } from "./auth-form";
import { authClient } from "../lib/auth";

/** Un renvoi par minute depuis ce lien ; l'API plafonne aussi à 5 par minute. */
const COOLDOWN_SECONDS = 60;

type SendState = "idle" | "sending" | "sent" | "tooMany" | "error";

const MESSAGES: Record<Exclude<SendState, "idle" | "sending">, string> = {
  sent: "C'est renvoyé. Regardez votre boîte mail.",
  tooMany: "Trop d'envois d'affilée. Attendez une minute, puis réessayez.",
  error: "L'envoi n'a pas marché. Réessayez dans un moment.",
};

/**
 * « Renvoyer l'e-mail » pour un parent pas encore connecté : après
 * l'inscription, ou après une connexion refusée parce que l'adresse n'est pas
 * confirmée. Même texte que le web (`resend-verification-email.tsx`). L'API
 * répond pareil que l'adresse ait un compte ou non, et le lien du mail ouvre
 * le web : on revient ensuite se connecter dans l'app.
 */
export function ResendVerification({
  email,
  startCoolingDown = false,
}: {
  email: string;
  /** Vrai juste après l'inscription : un e-mail vient de partir. */
  startCoolingDown?: boolean;
}) {
  const { s } = useAuthStyles();
  const [state, setState] = useState<SendState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(startCoolingDown ? COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  async function onResend() {
    setState("sending");
    try {
      // Pas de callbackURL : l'API envoie toujours vers l'accueil du web.
      const { error } = await authClient.sendVerificationEmail({ email });
      setState(error ? (error.status === 429 ? "tooMany" : "error") : "sent");
    } catch {
      setState("error");
    }
    setSecondsLeft(COOLDOWN_SECONDS);
  }

  const waiting = secondsLeft > 0;
  const off = waiting || state === "sending";
  const label =
    state === "sending"
      ? "Envoi…"
      : waiting
        ? `Renvoyer l'e-mail (dans ${secondsLeft} s)`
        : "Renvoyer l'e-mail";
  const message = state === "idle" || state === "sending" ? null : MESSAGES[state];

  return (
    <View>
      <View style={off ? s.disabled : undefined}>
        <AuthLink label={label} disabled={off} onPress={() => void onResend()} />
      </View>
      <View accessibilityLiveRegion="polite">
        {message ? <Text style={[s.hint, { textAlign: "center" }]}>{message}</Text> : null}
      </View>
    </View>
  );
}
