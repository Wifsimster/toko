import { createFileRoute, redirect } from "@tanstack/react-router";
import { EmptyState } from "@/components/shared/empty-state";
import { useTranslation } from "react-i18next";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { ApiError } from "@/lib/api-client";
import { SettingsForm } from "./settings-form";

export const Route = createFileRoute("/_authenticated/admin-settings/")({
  beforeLoad: async () => {
    const { getCachedSession } = await import("@/lib/auth-client");
    const session = (await getCachedSession()) as
      | { user?: { isAdmin?: boolean } }
      | null;
    if (!session?.user?.isAdmin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminSettingsPage,
  staticData: { crumb: "nav.adminSettings" },
});

function AdminSettingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useAdminSettings();

  if (isLoading) return <PageLoader />;

  if (error || !data) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="space-y-4">
        <PageHeader title={t("settings.title")} />
        <EmptyState mo="calme" title={forbidden ? t("errors.adminOnly") : t("errors.settingsLoadFailed")} />
      </div>
    );
  }

  return <SettingsForm key={data.updatedAt} initial={data} />;
}
