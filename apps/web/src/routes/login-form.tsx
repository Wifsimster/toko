import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, signIn } from "@/lib/auth-client";

export function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Conditional UI: silently primes the browser's autofill so the email
  // field can offer a registered passkey alongside saved credentials.
  // Browsers without conditional mediation just no-op.
  useEffect(() => {
    const pk = (authClient as unknown as {
      signIn?: { passkey?: (a: { autoFill: boolean }) => void };
    }).signIn?.passkey;
    if (!pk) return;
    const PKC =
      typeof window !== "undefined"
        ? (window as unknown as {
            PublicKeyCredential?: {
              isConditionalMediationAvailable?: () => Promise<boolean>;
            };
          }).PublicKeyCredential
        : undefined;
    PKC?.isConditionalMediationAvailable?.()
      .then((ok) => {
        if (ok) pk({ autoFill: true });
      })
      .catch(() => {
        // Fail silently — autofill is a progressive enhancement.
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        // Better Auth error messages are English — the audience is
        // French, so always surface our own translated copy.
        setError(t("login.errorInvalid"));
        return;
      }
      // Navigation pleine page : évite la course entre cookie de session et beforeLoad (getSession) en SPA
      window.location.assign("/dashboard");
    } catch {
      // Network/transport failure — without this catch the button would
      // stay stuck on "Connexion..." with no feedback.
      setError(t("login.errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold">
          {t("login.loginTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">{t("login.email")}</Label>
            <Input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email webauthn"
              autoFocus
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="login-password">{t("login.password")}</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
            disabled={loading}
          >
            {loading ? t("login.submittingLogin") : t("login.submitLogin")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
