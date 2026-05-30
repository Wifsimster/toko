import { useTranslation } from "react-i18next";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { primaryNavItems } from "@/config/nav";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { openMobile, setOpenMobile } = useSidebar();

  const tabs = primaryNavItems.slice(0, 4);

  return (
    <nav
      aria-label={t("nav.primaryNav")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((item) => {
          const isActive =
            pathname === item.to || pathname.startsWith(`${item.to}/`);
          const label = t(item.shortLabelKey ?? item.labelKey);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                aria-label={t(item.labelKey)}
                className={cn(
                  "flex h-full min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium transition-colors landscape:max-md:min-h-10 landscape:max-md:gap-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="size-5" aria-hidden="true" />
                <span className="line-clamp-1 leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            aria-label={t("nav.moreOptions")}
            aria-expanded={openMobile}
            aria-controls="app-sidebar"
            aria-haspopup="dialog"
            className="flex min-h-14 size-full flex-col items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:text-foreground landscape:max-md:min-h-10 landscape:max-md:gap-0"
          >
            <Menu className="size-5" aria-hidden="true" />
            <span className="line-clamp-1 leading-tight">{t("nav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
