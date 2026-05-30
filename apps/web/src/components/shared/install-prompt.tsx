import { useTranslation } from "react-i18next";
import { Download, Share, Plus, X } from "lucide-react";
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
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallPrompt() {
  const { t } = useTranslation();
  const { canPrompt, mode, install, dismiss } = useInstallPrompt();
  const isMobile = useIsMobile();

  if (!canPrompt) return null;

  const bodyText = mode === "ios" ? t("install.iosBody") : t("install.body");
  const secondaryLabel =
    mode === "ios" ? t("install.gotIt") : t("install.later");

  const iosSteps = mode === "ios" && (
    <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-1.5">
        <Share className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{t("install.iosStep1")}</span>
      </li>
      <li className="flex items-center gap-1.5">
        <Plus className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{t("install.iosStep2")}</span>
      </li>
    </ol>
  );

  if (isMobile) {
    return (
      <Sheet
        open={canPrompt}
        onOpenChange={(open) => {
          if (!open) dismiss();
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-label={t("install.regionLabel")}
        >
          <SheetHeader>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              >
                <Download className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <SheetTitle>{t("install.title")}</SheetTitle>
                <SheetDescription className="mt-1">
                  {bodyText}
                </SheetDescription>
                {iosSteps}
              </div>
            </div>
          </SheetHeader>
          <SheetFooter>
            {mode === "native" && (
              <Button onClick={() => void install()}>
                {t("install.cta")}
              </Button>
            )}
            <Button variant="ghost" onClick={dismiss}>
              {secondaryLabel}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <section
      aria-label={t("install.regionLabel")}
      className="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <div className="rounded-xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <Download className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {t("install.title")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{bodyText}</p>

            {iosSteps}

            <div className="mt-3 flex items-center gap-2">
              {mode === "native" && (
                <Button size="sm" onClick={() => void install()}>
                  {t("install.cta")}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={dismiss}>
                {secondaryLabel}
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("install.close")}
            className="-m-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
