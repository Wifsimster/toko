import { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResendVerificationEmail } from "@/components/shared/resend-verification-email";

// Shown after an email sign-up instead of signing the parent in: the account
// only opens once the address is confirmed (requireEmailVerification on the
// API). The API answers a sign-up the same way whether or not the address
// already has an account, and so does this screen.
export function CheckEmailPanel({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  // The form this replaces had the focus: move it to the new heading so a
  // screen reader announces the change.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  return (
    <section aria-labelledby="check-email-title" className="text-center lg:text-left">
      <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand/12 text-brand-strong lg:mx-0">
        <MailCheck className="size-6" aria-hidden="true" />
      </span>
      <h1
        id="check-email-title"
        ref={titleRef}
        tabIndex={-1}
        className="outline-none font-heading text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground"
      >
        {t("login.checkEmail.title")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-foreground/85">
        <Trans
          i18nKey="login.checkEmail.body"
          values={{ email }}
          components={{ strong: <strong className="font-semibold [overflow-wrap:anywhere]" /> }}
        />
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t("login.checkEmail.spam")}
      </p>
      <div className="mt-6 space-y-3">
        <ResendVerificationEmail email={email} startCoolingDown />
        <Button type="button" variant="ghost" className="h-11 w-full" onClick={onBack}>
          {t("login.checkEmail.back")}
        </Button>
      </div>
    </section>
  );
}
