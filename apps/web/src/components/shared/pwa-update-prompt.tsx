import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePwaUpdate } from "@/hooks/use-pwa-update";

export function PWAUpdatePrompt() {
  const { t } = useTranslation();
  const { needRefresh, update, dismiss } = usePwaUpdate();
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <Sheet
        open={needRefresh}
        onOpenChange={(open) => {
          if (!open && !updating) dismiss();
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-label={t("pwaUpdate.regionLabel")}
        >
          <SheetHeader>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              >
                <RefreshCw className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <SheetTitle>{t("pwaUpdate.title")}</SheetTitle>
                <SheetDescription className="mt-1">
                  {t("pwaUpdate.body")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <SheetFooter>
            <Button
              onClick={handleUpdate}
              disabled={updating}
              aria-busy={updating}
            >
              {updating ? t("pwaUpdate.updating") : t("pwaUpdate.cta")}
            </Button>
            <Button
              variant="ghost"
              onClick={dismiss}
              disabled={updating}
            >
              {t("pwaUpdate.later")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={t("pwaUpdate.regionLabel")}
      className="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <div className="rounded-xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <RefreshCw className="size-4" />
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
            className="-m-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
