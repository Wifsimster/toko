import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  sendVerificationEmail,
  refreshSession,
} from "@/lib/auth-client";

// Shown when the signed-in invitee hasn't confirmed their email yet. Lets
// them (re)send the confirmation email and re-check once they've clicked the
// link — the latter bypasses the session cookie cache so a freshly verified
// address is picked up immediately instead of after the cache's 5-min TTL.
export function EmailVerificationPrompt({
  email,
  token,
}: {
  email: string | null;
  token: string;
}) {
  const { t } = useTranslation();
  const [sendState, setSendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [rechecking, setRechecking] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setSendState("sending");
    try {
      const res = await sendVerificationEmail({
        email,
        callbackURL: `/invite/${token}`,
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
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
      <div>
        <p className="font-medium">{t("invitePage.emailUnverifiedTitle")}</p>
        <p className="mt-1 text-muted-foreground">
          {t("invitePage.emailUnverifiedHelp", { email })}
        </p>
      </div>

      <Button
        size="sm"
        onClick={handleResend}
        disabled={sendState === "sending" || !email}
      >
        {sendState === "sending" && (
          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
        )}
        {t("invitePage.resendVerification")}
      </Button>

      {sendState === "sent" && (
        <p className="text-success-foreground">
          {t("invitePage.resendVerificationSent")}
        </p>
      )}
      {sendState === "error" && (
        <p className="text-destructive">
          {t("invitePage.resendVerificationError")}
        </p>
      )}

      <button
        type="button"
        onClick={handleRecheck}
        disabled={rechecking}
        className="block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60"
      >
        {t("invitePage.alreadyVerified")}
      </button>
    </div>
  );
}
