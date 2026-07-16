import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { hubGroups, hubNavItems } from "@/config/nav";

export const Route = createFileRoute("/_authenticated/suivi/")({
  component: SuiviHubPage,
  staticData: {
    crumb: "nav.tracking",
  },
});

// The "Suivi" hub: one calm entry point to every daily-tracking screen, so the
// sidebar stays at 5 parent entries (Phase 1 simplification) without burying
// anything. Grouped, explicit labels, one tap to each tool.
function SuiviHubPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("suiviHub.title")}
        description={t("suiviHub.subtitle")}
      />

      {hubGroups.map((group) => {
        const items = hubNavItems.filter((i) => i.hubGroup === group.key);
        if (items.length === 0) return null;
        return (
          <section key={group.key} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t(group.labelKey)}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <Link key={item.to} to={item.to} className="group block">
                  <Card className="transition-colors hover:border-primary/40 hover:bg-primary/5">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70 group-hover:bg-primary/10 group-hover:text-primary">
                        <item.icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{t(item.labelKey)}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {t(item.descriptionKey)}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
