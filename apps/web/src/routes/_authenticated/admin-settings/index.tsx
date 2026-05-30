import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { ApiError } from "@/lib/api-client";
import { getCachedSession } from "@/lib/auth-client";
import { SettingsForm } from "./settings-form";

export const Route = createFileRoute("/_authenticated/admin-settings/")({
  // Hard gate: only admins reach this route. The API also enforces it
  // (403), so this is purely to avoid showing a forbidden shell.
  beforeLoad: async () => {
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

export function AdminSettingsPage() {
  const { data, isLoading, error } = useAdminSettings();

  if (isLoading) return <PageLoader />;

  if (error || !data) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="space-y-4">
        <PageHeader title="Paramètres de l'application" />
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            {forbidden
              ? "Cette page est réservée aux administrateurs."
              : "Impossible de charger les paramètres pour le moment."}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Keyed on the row's updatedAt so a successful save re-mounts the form
  // with the freshly persisted values as its new baseline.
  return <SettingsForm key={data.updatedAt} initial={data} />;
}
