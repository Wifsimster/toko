import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailVerificationPrompt } from "./email-verification-prompt";

interface BodyProps {
  meta: {
    childName: string;
    inviterName: string;
    children?: { id: string; name: string }[];
  };
  currentEmail: string | null;
  emailVerified: boolean;
  isPending: boolean;
  acceptError: string | null;
  onAccept: () => void;
  token: string;
  expiresAt: string;
  formatDate: (iso: string) => string;
}

export function InviteAcceptBody({
  meta,
  currentEmail,
  emailVerified,
  isPending,
  acceptError,
  onAccept,
  token,
  expiresAt,
  formatDate,
}: BodyProps) {
  const { t } = useTranslation();
  const signedIn = !!currentEmail;
  const childList = meta.children ?? [];
  const isBulk = childList.length > 1;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {isBulk ? (
          <Trans
            i18nKey="invitePage.introBulk"
            values={{ inviter: meta.inviterName, count: childList.length }}
            count={childList.length}
            components={{ strong: <span className="font-semibold" /> }}
          />
        ) : (
          <Trans
            i18nKey="invitePage.intro"
            values={{ inviter: meta.inviterName, child: meta.childName }}
            components={{ strong: <span className="font-semibold" /> }}
          />
        )}
      </p>

      {isBulk && (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("invitePage.childrenListTitle")}
          </p>
          <ul className="mt-2 space-y-1">
            {childList.map((c) => (
              <li key={c.id} className="text-sm font-medium">
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {t("invitePage.expires", { date: formatDate(expiresAt) })}
      </p>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <p>{t("childAccess.consentNotice")}</p>
        <p className="mt-2">{t("childAccess.controllerNotice")}</p>
      </div>

      {!signedIn ? (
        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
          <p>{t("invitePage.signedOutPrompt")}</p>
          <Link
            to="/login"
            search={{ next: `/invite/${token}` } as never}
            className="inline-block"
          >
            <Button size="sm">{t("invitePage.signedOutCta")}</Button>
          </Link>
        </div>
      ) : !emailVerified ? (
        <EmailVerificationPrompt email={currentEmail} token={token} />
      ) : (
        <>
          {acceptError && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {acceptError}
            </p>
          )}
          <div className="flex justify-end">
            <Button onClick={onAccept} disabled={isPending}>
              {isPending && (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              )}
              {t("invitePage.acceptCta")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
