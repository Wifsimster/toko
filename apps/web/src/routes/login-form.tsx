import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { ResendVerificationEmail } from "@/components/shared/resend-verification-email";
import { authClient, signIn } from "@/lib/auth-client";

export function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

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
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email.trim());
          setError(t("login.errorEmailNotVerified"));
        } else {
          setError(t("login.errorInvalid"));
        }
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError(t("login.errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <PasswordInput
          id="login-password"
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
      {unverifiedEmail && <ResendVerificationEmail email={unverifiedEmail} />}
      <Button
        type="submit"
        className="h-11 w-full text-base shadow-sm shadow-brand/20"
        disabled={loading}
      >
        {loading ? t("login.submittingLogin") : t("login.submitLogin")}
      </Button>
    </form>
  );
}
