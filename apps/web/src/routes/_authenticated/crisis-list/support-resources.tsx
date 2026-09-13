
import { useTranslation } from "react-i18next";

import {
  Phone,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Emergency numbers and where to turn — always the last block on the page. */

export function SupportResources({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  const { t } = useTranslation();
  return (
    <Card
      ref={ref}
      tabIndex={-1}
      className="scroll-mt-4 border-info-border bg-info-surface/40 focus:outline-none"
    >
      <CardContent className="space-y-3 py-4">
        <div className="space-y-1">
          <p className="font-medium text-sm">{t("crisis.supportTitle")}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("crisis.supportBody")}
          </p>
        </div>
        <ul className="space-y-2">
          <li>
            <a
              href="tel:3114"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <Phone className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{t("crisis.support3114Label")}</span>
                <span className="block text-xs text-muted-foreground">
                  {t("crisis.support3114Hint")}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href="tel:0800235236"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <Phone className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">
                  {t("crisis.supportAlloParentsLabel")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("crisis.supportAlloParentsNumber")} ·{" "}
                  {t("crisis.supportAlloParentsHint")}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href={t("crisis.supportHyperSupersUrl")}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <ExternalLink className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">
                  {t("crisis.supportHyperSupersLabel")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("crisis.supportHyperSupersHint")}
                </span>
              </span>
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
