import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { Fingerprint, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUiStore } from "@/stores/ui-store";
import { authClient, useSession } from "@/lib/auth-client";
import { isBiometricSupported } from "@/lib/biometric";

// Business rule E5: privacy screen that hides the parent UI after
// 10 minutes of inactivity or when the user taps the manual lock button.
// The overlay blocks interaction and requires either fingerprint/face
// unlock (if a passkey is enrolled and the device supports it) or the
// account password. The password input is always reachable as a fallback —
// for ADHD users, never hide the way out.
const MAX_BIOMETRIC_ATTEMPTS = 3;

export function LockOverlay() {
  const { t } = useTranslation();
  const isLocked = useUiStore((s) => s.isLocked);
  const unlock = useUiStore((s) => s.unlock);
  const session = useSession();
  const email = session.data?.user?.email ?? "";

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricAttempts, setBiometricAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  // Probe the platform authenticator once when the overlay mounts. The
  // answer doesn't change mid-session.
  useEffect(() => {
    let cancelled = false;
    if (!isLocked) return;
    void isBiometricSupported().then((ok) => {
      if (!cancelled) setBiometricAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [isLocked]);

  // Reset transient state every time the overlay re-opens.
  useEffect(() => {
    if (isLocked) {
      setBiometricAttempts(0);
      setShowPassword(false);
      setPassword("");
      setErrorKey(null);
      setIsVerifying(false);
    }
  }, [isLocked]);

  const handleBiometric = useCallback(async () => {
    setErrorKey(null);
    setIsVerifying(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) throw new Error(String(result.error.message ?? "failed"));
      unlock();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const cancelled = /cancel|abort|notallowed/i.test(message);
      const next = biometricAttempts + 1;
      setBiometricAttempts(next);
      // Three strikes → flip to password to avoid a frustrating loop.
      if (next >= MAX_BIOMETRIC_ATTEMPTS) setShowPassword(true);
      // A user-cancellation isn't really an error — quietly let them try
      // again or pick the password option instead of accusing them.
      if (!cancelled) setErrorKey("passkeyFailed");
    } finally {
      setIsVerifying(false);
    }
  }, [biometricAttempts, unlock]);

  const handlePasswordSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!email || !password) return;
      setErrorKey(null);
      setIsVerifying(true);
      try {
        const result = await authClient.signIn.email({ email, password });
        if (result?.error) throw new Error(String(result.error.message ?? "failed"));
        unlock();
      } catch {
        setErrorKey("passwordFailed");
        setPassword("");
      } finally {
        setIsVerifying(false);
      }
    },
    [email, password, unlock],
  );

  if (!isLocked) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("lock.title")}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-background/95 px-4 backdrop-blur-md"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">{t("lock.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("lock.description")}
        </p>
      </div>

      {errorKey && (
        <p
          role="alert"
          className="max-w-sm text-center text-sm text-destructive"
        >
          {t(`lock.${errorKey}`)}
        </p>
      )}

      {!showPassword ? (
        <div className="flex w-full max-w-xs flex-col items-stretch gap-3">
          {biometricAvailable && (
            <Button
              onClick={handleBiometric}
              disabled={isVerifying}
              autoFocus
              size="lg"
              className="gap-2"
            >
              {isVerifying ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Fingerprint className="h-5 w-5" aria-hidden="true" />
              )}
              {t("lock.unlockBiometric")}
            </Button>
          )}
          <Button
            variant={biometricAvailable ? "ghost" : "default"}
            onClick={() => {
              setErrorKey(null);
              setShowPassword(true);
            }}
            autoFocus={!biometricAvailable}
            size="lg"
          >
            {t("lock.unlockPassword")}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handlePasswordSubmit}
          className="flex w-full max-w-xs flex-col gap-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="lock-password">{t("lock.passwordLabel")}</Label>
            <Input
              id="lock-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              disabled={isVerifying}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isVerifying || !password}
            className="gap-2"
          >
            {isVerifying && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {t("lock.unlock")}
          </Button>
          {biometricAvailable && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setErrorKey(null);
                setShowPassword(false);
              }}
              disabled={isVerifying}
            >
              {t("lock.backToBiometric")}
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
