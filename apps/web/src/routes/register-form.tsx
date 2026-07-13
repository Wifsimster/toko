import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LegalConsentText } from "@/components/shared/legal-consent-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/lib/auth-client";
import { trackEvent } from "@/lib/analytics";

type RegisterState = {
  name: string;
  email: string;
  password: string;
  consent: boolean;
  error: string;
  loading: boolean;
};
type RegisterAction =
  | { type: "setField"; field: "name" | "email" | "password"; value: string }
  | { type: "setConsent"; value: boolean }
  | { type: "setError"; error: string }
  | { type: "setLoading"; loading: boolean };

function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value };
    case "setConsent":
      return { ...state, consent: action.value };
    case "setError":
      return { ...state, error: action.error };
    case "setLoading":
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

const REGISTER_INITIAL: RegisterState = {
  name: "",
  email: "",
  password: "",
  consent: false,
  error: "",
  loading: false,
};

export function RegisterForm() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(registerReducer, REGISTER_INITIAL);
  const { name, email, password, consent, error, loading } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      dispatch({ type: "setError", error: t("login.errorConsentRequired") });
      return;
    }
    dispatch({ type: "setError", error: "" });
    dispatch({ type: "setLoading", loading: true });

    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        dispatch({ type: "setError", error: t("login.errorRegister") });
        return;
      }
      trackEvent("signup_completed");
      window.location.assign("/dashboard");
    } catch {
      dispatch({ type: "setError", error: t("login.errorNetwork") });
    } finally {
      dispatch({ type: "setLoading", loading: false });
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold">
          {t("login.registerTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-name">{t("login.name")}</Label>
            <Input
              id="register-name"
              autoComplete="name"
              placeholder={t("login.namePlaceholder")}
              value={name}
              onChange={(e) => dispatch({ type: "setField", field: "name", value: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">{t("login.email")}</Label>
            <Input
              id="register-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => dispatch({ type: "setField", field: "email", value: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">{t("login.password")}</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => dispatch({ type: "setField", field: "password", value: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="register-consent"
              checked={consent}
              onCheckedChange={(v) => dispatch({ type: "setConsent", value: v === true })}
              className="mt-0.5"
            />
            <Label
              htmlFor="register-consent"
              className="text-xs font-normal leading-relaxed text-muted-foreground"
            >
              <LegalConsentText i18nKey="login.consentLabel" />
            </Label>
          </div>
          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full shadow-sm shadow-primary/20"
            disabled={loading || !consent}
          >
            {loading
              ? t("login.submittingRegister")
              : t("login.submitRegister")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
