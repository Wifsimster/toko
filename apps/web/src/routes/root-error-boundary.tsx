import { useRouter } from "@tanstack/react-router";
import { Mo } from "@/components/mo/mo";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SessionUnavailableError } from "@/lib/session-cache";

export function RootErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <Mo state="calme" size={112} breathe className="mb-2" />
        <h1 className="text-2xl font-extrabold">{t("errors.generic")}</h1>
        <p className="mt-2 text-muted-foreground">
          {error instanceof SessionUnavailableError
            ? t("errors.sessionUnavailable")
            : error.message || t("errors.somethingWentWrong")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.invalidate()}>
            {t("common.retry")}
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")}>
            {t("errors.backToDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
