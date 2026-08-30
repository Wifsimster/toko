import { useTranslation } from "react-i18next";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { androidAppUrl, isIosDevice } from "@/lib/android-app";

/**
 * Sidebar promo for the Android companion app. Rendered only when
 * `VITE_ANDROID_APP_URL` is configured, and hidden on iOS devices where the
 * offer cannot be taken up. One line of copy, one action, one dismiss — the
 * card never comes back once dismissed.
 */
export function AndroidAppPromo() {
  const { t } = useTranslation();
  const dismissed = useUiStore((s) => s.androidPromoDismissed);
  const dismiss = useUiStore((s) => s.dismissAndroidPromo);

  if (!androidAppUrl || dismissed) return null;
  if (typeof navigator !== "undefined" && isIosDevice(navigator.userAgent)) {
    return null;
  }

  return (
    <section
      aria-label={t("androidPromo.regionLabel")}
      className="relative rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("androidPromo.dismiss")}
        className="absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>

      <p className="flex items-center gap-2 pr-7 text-sm font-medium text-sidebar-foreground">
        <Smartphone className="size-4 shrink-0 text-primary" aria-hidden="true" />
        {t("androidPromo.title")}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">
        {t("androidPromo.body")}
      </p>

      <Button
        size="sm"
        className="mt-3 w-full"
        render={
          <a href={androidAppUrl} target="_blank" rel="noopener noreferrer" />
        }
      >
        {t("androidPromo.cta")}
      </Button>
    </section>
  );
}
