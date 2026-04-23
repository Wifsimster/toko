import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

// Business rule E5: privacy screen that hides the parent UI after
// 5 minutes of inactivity or when the user taps the manual lock button.
// The overlay blocks interaction and blurs the background content.
export function LockOverlay() {
  const { t } = useTranslation();
  const isLocked = useUiStore((s) => s.isLocked);
  const unlock = useUiStore((s) => s.unlock);

  if (!isLocked) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("lock.title")}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-md"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">{t("lock.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("lock.description")}
        </p>
      </div>
      <Button onClick={unlock} autoFocus>
        {t("lock.unlock")}
      </Button>
    </div>
  );
}
