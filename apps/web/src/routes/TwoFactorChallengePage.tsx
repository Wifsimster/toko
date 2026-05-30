import { useReducer } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Smartphone, KeyRound } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type TfMode = "totp" | "backup";

type TfState = {
  mode: TfMode;
  code: string;
  trust: boolean;
  error: string;
  loading: boolean;
};

type TfAction =
  | { type: "TOGGLE_MODE" }
  | { type: "SET_CODE"; code: string }
  | { type: "SET_TRUST"; trust: boolean }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SUBMIT_DONE" };

const initialTfState: TfState = {
  mode: "totp",
  code: "",
  trust: false,
  error: "",
  loading: false,
};

function tfReducer(state: TfState, action: TfAction): TfState {
  switch (action.type) {
    case "TOGGLE_MODE":
      return { ...state, mode: state.mode === "totp" ? "backup" : "totp", code: "", error: "" };
    case "SET_CODE":
      return { ...state, code: action.code };
    case "SET_TRUST":
      return { ...state, trust: action.trust };
    case "SUBMIT_START":
      return { ...state, loading: true, error: "" };
    case "SUBMIT_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SUBMIT_DONE":
      return { ...state, loading: false };
  }
}

// Reached after sign-in when the account has 2FA enabled. Better Auth
// has set a short-lived `betterauth.two_factor` cookie that carries the
// half-authenticated state; we exchange it here for a real session.
export function TwoFactorChallengePage() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(tfReducer, initialTfState);
  const { mode, code, trust, error, loading } = state;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SUBMIT_START" });
    try {
      const tf = (authClient as unknown as {
        twoFactor: {
          verifyTotp: (a: {
            code: string;
            trustDevice?: boolean;
          }) => Promise<{ error?: { message?: string } | null }>;
          verifyBackupCode: (a: {
            code: string;
            trustDevice?: boolean;
          }) => Promise<{ error?: { message?: string } | null }>;
        };
      }).twoFactor;
      const res =
        mode === "totp"
          ? await tf.verifyTotp({ code, trustDevice: trust })
          : await tf.verifyBackupCode({ code, trustDevice: trust });
      if (res.error) {
        dispatch({ type: "SUBMIT_ERROR", error: t("twoFactorChallenge.errorInvalid") });
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      dispatch({ type: "SUBMIT_ERROR", error: t("twoFactorChallenge.errorNetwork") });
    } finally {
      dispatch({ type: "SUBMIT_DONE" });
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,oklch(0.85_0.08_30_/_0.08),transparent)]" />

      <Link
        to="/login"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("twoFactorChallenge.backToLogin")}
      </Link>

      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <BrandLogo className="mx-auto mb-4 size-12 rounded-2xl shadow-md shadow-primary/20" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("twoFactorChallenge.title")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {mode === "totp"
              ? t("twoFactorChallenge.subtitleTotp")
              : t("twoFactorChallenge.subtitleBackup")}
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {mode === "totp" ? (
                <Smartphone className="size-4" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {mode === "totp"
                ? t("twoFactorChallenge.cardTitleTotp")
                : t("twoFactorChallenge.cardTitleBackup")}
            </CardTitle>
            <CardDescription>
              {mode === "totp"
                ? t("twoFactorChallenge.cardDescTotp")
                : t("twoFactorChallenge.cardDescBackup")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tf-code">
                  {mode === "totp"
                    ? t("twoFactorChallenge.codeLabel")
                    : t("twoFactorChallenge.backupLabel")}
                </Label>
                <Input
                  id="tf-code"
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode={mode === "totp" ? "numeric" : "text"}
                  pattern={mode === "totp" ? "[0-9]{6}" : undefined}
                  maxLength={mode === "totp" ? 6 : 32}
                  placeholder={mode === "totp" ? "123456" : "XXXX-XXXX"}
                  value={code}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_CODE",
                      code: mode === "totp" ? e.target.value.replace(/\D/g, "") : e.target.value,
                    })
                  }
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={trust}
                  onChange={(e) => dispatch({ type: "SET_TRUST", trust: e.target.checked })}
                />
                {t("twoFactorChallenge.trustDevice")}
              </label>

              {error && (
                <p role="alert" aria-live="polite" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full shadow-sm shadow-primary/20"
                disabled={
                  loading || (mode === "totp" ? code.length !== 6 : code.length < 4)
                }
              >
                {loading && (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                )}
                {t("twoFactorChallenge.verifyCta")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  onClick={() => dispatch({ type: "TOGGLE_MODE" })}
                >
                  {mode === "totp"
                    ? t("twoFactorChallenge.useBackup")
                    : t("twoFactorChallenge.useTotp")}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
