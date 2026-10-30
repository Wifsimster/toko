import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Sparkles, X } from "lucide-react";
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
import { useAppUpdated } from "@/hooks/use-app-updated";

export function AppUpdatedBanner() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { announce, version, changeCount, dismiss } =
    useAppUpdated(__APP_VERSION__);

  if (!announce) return null;

  const shortVersion = version.split(".").slice(0, 2).join(".");
  const summary = t("appUpdated.summary", {
    version: shortVersion,
    count: changeCount,
  });

  const cta = (
    <Button
      size={isMobile ? "default" : "sm"}
      className={isMobile ? "w-full" : undefined}
      render={<Link to="/nouveautes" onClick={dismiss} />}
    >
      {t("appUpdated.cta")}
    </Button>
  );

  const later = (
    <Button
      size={isMobile ? "default" : "sm"}
      variant="ghost"
      className={isMobile ? "w-full" : undefined}
      onClick={dismiss}
    >
      {t("appUpdated.later")}
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) dismiss();
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-label={t("appUpdated.regionLabel")}
        >
          <SheetHeader>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-strong"
              >
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <SheetTitle>{t("appUpdated.title")}</SheetTitle>
                <SheetDescription className="mt-1">{summary}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <SheetFooter>
            {cta}
            {later}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <section
      aria-live="polite"
      aria-label={t("appUpdated.regionLabel")}
      className="fixed bottom-28 right-6 z-50 hidden max-w-sm md:block print:hidden"
    >
      <div className="rounded-xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-strong"
          >
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {t("appUpdated.title")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{summary}</p>

            <div className="mt-3 flex items-center gap-2">
              {cta}
              {later}
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("appUpdated.close")}
            className="-m-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
