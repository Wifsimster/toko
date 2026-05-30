import { useTranslation } from "react-i18next";
import {
  Phone,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mirrors the support resources shown on the crisis-list page so the
// numbers stay consistent across the app. Always free, no upsell.
export function SupportResources() {
  const { t } = useTranslation();
  return (
    <Card className="border-info-border bg-info-surface/40">
      <CardContent className="space-y-3 py-4">
        <div className="space-y-1">
          <p className="font-medium text-sm">{t("burnout.support.title")}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("burnout.support.body")}
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
                <span className="font-medium">
                  {t("burnout.support.tel3114Label")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("burnout.support.tel3114Hint")}
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
                  {t("burnout.support.alloParentsLabel")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("burnout.support.alloParentsHint")}
                </span>
              </span>
            </a>
          </li>
          <li>
            <a
              href="https://www.tdah-france.fr/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-start gap-2 rounded-md p-2 -mx-2 hover:bg-accent/50 transition-colors"
            >
              <ExternalLink className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">
                  {t("burnout.support.hyperSupersLabel")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("burnout.support.hyperSupersHint")}
                </span>
              </span>
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
