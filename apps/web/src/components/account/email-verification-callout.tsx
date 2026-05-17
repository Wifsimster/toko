import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  useSession,
  sendVerificationEmail,
  refreshSession,
} from "@/lib/auth-client";

// Surfaces in the account page when the signed-in parent hasn't confirmed
// their email. Lets them (re)send the confirmation email and re-check once
// they've clicked the link — the recheck bypasses the session cookie cache
// so a freshly verified address shows immediately instead of after the
// cache's 5-minute TTL.
export function EmailVerificationCallout() {
  const { t } = useTranslation();
  const session = useSession();
  const email = session.data?.user?.email ?? null;
  const verified = session.data?.user?.emailVerified ?? false;
  const [sendState, setSendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [rechecking, setRechecking] = useState(false);

  if (!email || verified) return null;

  const handleResend = async () => {
    setSendState("sending");
    try {
      const res = await sendVerificationEmail({
        email,
        callbackURL: "/account",
      });
      setSendState(res.error ? "error" : "sent");
    } catch {
      setSendState("error");
    }
  };

  const handleRecheck = async () => {
    setRechecking(true);
    try {
      await refreshSession();
    } catch {
      // Ignore — the reload below re-fetches the session regardless.
    }
    window.location.reload();
  };

  return (
    <Callout variant="warning">
      <div className="space-y-3">
        <div>
          <p className="font-medium">{t("account.emailUnverifiedTitle")}</p>
          <p className="mt-1">
            {t("account.emailUnverifiedHelp", { email })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={handleResend}
            disabled={sendState === "sending"}
          >
            {sendState === "sending" && (
              <Loader2
                className="h-4 w-4 animate-spin"
                data-icon="inline-start"
              />
            )}
            {t("account.resendVerification")}
          </Button>
          <button
            type="button"
            onClick={handleRecheck}
            disabled={rechecking}
            className="text-xs underline-offset-4 hover:underline disabled:opacity-60"
          >
            {t("account.alreadyVerified")}
          </button>
        </div>
        <div aria-live="polite">
          {sendState === "sent" && (
            <p className="text-xs font-medium">
              {t("account.resendVerificationSent")}
            </p>
          )}
          {sendState === "error" && (
            <p className="text-xs font-medium text-destructive">
              {t("account.resendVerificationError")}
            </p>
          )}
        </div>
      </div>
    </Callout>
  );
}
