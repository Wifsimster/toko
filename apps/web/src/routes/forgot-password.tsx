import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forgetPassword } from "@/lib/auth-client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Better Auth always returns the same response whether the account
      // exists or not (anti-enumeration), so we don't surface the result.
      await forgetPassword({ email, redirectTo: "/reset-password" });
      setSent(true);
    } catch {
      // Network/transport failure — surface it instead of leaving the
      // button stuck on "Envoi…" or falsely showing the sent state.
      setError(t("forgotPassword.errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,oklch(0.85_0.08_30_/_0.08),transparent)]" />

      <Link
        to="/login"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("forgotPassword.backToLogin")}
      </Link>

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <BrandLogo className="mx-auto mb-4 h-12 w-12 rounded-2xl shadow-md shadow-primary/20" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Tokō
          </h1>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold">
              {t("forgotPassword.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("forgotPassword.confirmation")}
                </p>
                <Link
                  to="/login"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  {t("forgotPassword.backToLogin")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("forgotPassword.intro")}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">{t("login.email")}</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {loading
                    ? t("forgotPassword.submitting")
                    : t("forgotPassword.submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
