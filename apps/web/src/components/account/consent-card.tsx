import { useTranslation } from "react-i18next";
import { FileCheck, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConsents, useRevokeConsent } from "@/hooks/use-consents";
import type { ConsentType } from "@focusflow/validators";

// Consents the user can withdraw individually from this screen without
// breaking the service. The core consents (terms, privacy, health-data
// processing, parental authority) underpin the account itself — withdrawing
// them is done by deleting the child's data or the account, so they are shown
// for transparency but have no per-row revoke button.
const REVOCABLE: ReadonlySet<ConsentType> = new Set([
  "ai_usage",
  "research",
]);

export function ConsentCard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const { data: consents, isLoading } = useConsents();
  const revoke = useRevokeConsent();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const labelFor = (type: ConsentType) =>
    i18n.exists(`account.consent.types.${type}`)
      ? t(`account.consent.types.${type}`)
      : type;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="size-4" />
          {t("account.consent.title")}
        </CardTitle>
        <CardDescription>{t("account.consent.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isLoading ? (
          <p className="text-muted-foreground">{t("account.consent.loading")}</p>
        ) : !consents || consents.length === 0 ? (
          <p className="text-muted-foreground">{t("account.consent.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {consents.map((consent) => {
              const revocable = REVOCABLE.has(consent.type);
              return (
                <li
                  key={consent.id}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{labelFor(consent.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("account.consent.grantedOn", {
                        date: formatDate(consent.grantedAt),
                      })}
                    </p>
                  </div>
                  {revocable ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revoke.mutate(consent.type)}
                      disabled={revoke.isPending}
                    >
                      {revoke.isPending && revoke.variables === consent.type ? (
                        <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />
                      ) : null}
                      {t("account.consent.revoke")}
                    </Button>
                  ) : (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {t("account.consent.required")}
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("account.consent.withdrawNotice")}{" "}
          <a href="#delete" className="underline hover:text-foreground">
            {t("account.consent.withdrawLink")}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
