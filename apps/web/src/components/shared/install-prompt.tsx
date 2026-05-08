import { useTranslation } from "react-i18next";
import { Download, Share, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallPrompt() {
  const { t } = useTranslation();
  const { canPrompt, mode, install, dismiss } = useInstallPrompt();

  if (!canPrompt) return null;

  return (
    <div
      role="region"
      aria-label={t("install.regionLabel")}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:px-0 md:pb-0"
    >
      <div className="rounded-xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <Download className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {t("install.title")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "ios" ? t("install.iosBody") : t("install.body")}
            </p>

            {mode === "ios" && (
              <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Share className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t("install.iosStep1")}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t("install.iosStep2")}</span>
                </li>
              </ol>
            )}

            <div className="mt-3 flex items-center gap-2">
              {mode === "native" && (
                <Button size="sm" onClick={() => void install()}>
                  {t("install.cta")}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={dismiss}>
                {mode === "ios" ? t("install.gotIt") : t("install.later")}
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("install.close")}
            className="-m-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
