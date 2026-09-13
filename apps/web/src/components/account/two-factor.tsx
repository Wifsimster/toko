import { useTranslation } from "react-i18next";
import {
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnableTwoFactorDialog } from "./two-factor-enable-dialog";
import { DisableTwoFactorDialog } from "./two-factor-disable-dialog";

/** Two-factor status, with the enable and disable flows behind it. */

export function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation();
  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold inline-flex items-center gap-2">
            <Smartphone className="size-4" />
            {t("security.twoFactor.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("security.twoFactor.help")}
          </p>
        </div>
        {enabled ? (
          <Badge variant="default" className="shrink-0">
            {t("security.twoFactor.statusOn")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">
            {t("security.twoFactor.statusOff")}
          </Badge>
        )}
      </header>
      {enabled ? <DisableTwoFactorDialog /> : <EnableTwoFactorDialog />}
    </section>
  );
}
