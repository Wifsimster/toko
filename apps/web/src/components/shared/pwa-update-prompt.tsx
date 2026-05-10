import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaUpdate } from "@/hooks/use-pwa-update";

export function PWAUpdatePrompt() {
  const { t } = useTranslation();
  const { needRefresh, update, dismiss } = usePwaUpdate();
  const [updating, setUpdating] = useState(false);

  if (!needRefresh) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await update();
    } catch {
      setUpdating(false);
    }
  };

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={t("pwaUpdate.regionLabel")}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+10rem)] md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:px-0 md:pb-0"
    >
      <div className="rounded-xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <RefreshCw className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {t("pwaUpdate.title")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("pwaUpdate.body")}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={updating}
                aria-busy={updating}
              >
                {updating ? t("pwaUpdate.updating") : t("pwaUpdate.cta")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismiss}
                disabled={updating}
              >
                {t("pwaUpdate.later")}
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            disabled={updating}
            aria-label={t("pwaUpdate.close")}
            className="-m-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
