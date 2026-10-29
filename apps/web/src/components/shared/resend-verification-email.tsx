import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";

export const RESEND_COOLDOWN_SECONDS = 60;

type SendState = "idle" | "sending" | "sent" | "tooMany" | "error";

export function ResendVerificationEmail({
  email,
  startCoolingDown = false,
}: {
  email: string;
  startCoolingDown?: boolean;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<SendState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(
    startCoolingDown ? RESEND_COOLDOWN_SECONDS : 0,
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const handleResend = async () => {
    setState("sending");
    try {
      const res = await sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });
      if (res.error) {
        setState(res.error.status === 429 ? "tooMany" : "error");
      } else {
        setState("sent");
      }
    } catch {
      setState("error");
    }
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  };

  const waiting = secondsLeft > 0;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={() => void handleResend()}
        disabled={state === "sending" || waiting}
      >
        {state === "sending" && (
          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
        )}
        {state === "sending"
          ? t("login.resend.sending")
          : waiting
            ? t("login.resend.wait", { seconds: secondsLeft })
            : t("login.resend.action")}
      </Button>
      <div aria-live="polite" className="text-center text-sm">
        {state === "sent" && (
          <p className="text-muted-foreground">{t("login.resend.sent")}</p>
        )}
        {state === "tooMany" && (
          <p className="text-destructive">{t("login.resend.tooMany")}</p>
        )}
        {state === "error" && (
          <p className="text-destructive">{t("login.resend.error")}</p>
        )}
      </div>
    </div>
  );
}
