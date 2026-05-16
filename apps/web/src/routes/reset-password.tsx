import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/auth-client";

type ResetPasswordSearch = { token: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    const token = typeof search.token === "string" ? search.token : "";
    return { token };
  },
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/login" });
    }
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);

    const result = await resetPassword({ newPassword: password, token });

    if (result.error) {
      setError(result.error.message ?? t("resetPassword.errorInvalid"));
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
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
              {t("resetPassword.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("resetPassword.success")}
                </p>
                <Link
                  to="/login"
                  className={buttonVariants({
                    className: "w-full shadow-sm shadow-primary/20",
                  })}
                >
                  {t("resetPassword.goToLogin")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-password">
                    {t("resetPassword.newPassword")}
                  </Label>
                  <Input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    placeholder={t("login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full shadow-sm shadow-primary/20"
                  disabled={loading}
                >
                  {loading
                    ? t("resetPassword.submitting")
                    : t("resetPassword.submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
