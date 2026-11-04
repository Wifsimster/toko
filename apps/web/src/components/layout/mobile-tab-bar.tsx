import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouterState } from "@tanstack/react-router";
import { isMoreActive, matchesPath, moreNavItem, primaryNavItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import { SOSTabButton } from "@/components/shared/sos-crisis-button";

export function MobileTabBar() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    ...primaryNavItems.map((item) => ({ item, isActive: matchesPath(pathname, item.to) })),
    { item: moreNavItem, isActive: isMoreActive(pathname) },
  ];
  const sosAt = Math.min(2, tabs.length);

  return (
    <nav
      aria-label={t("nav.primaryNav")}
      className="fixed inset-x-0 bottom-0 z-40 print:hidden border-t border-border/60 bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ item, isActive }, index) => (
          <Fragment key={item.to}>
          {index === sosAt && (
            <li>
              <SOSTabButton />
            </li>
          )}
          <li>
            <Link
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              aria-label={t(item.labelKey)}
              className={cn(
                "flex h-full min-h-14 flex-col items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium transition-colors landscape:max-md:min-h-10 landscape:max-md:gap-0",
                isActive
                  ? "text-brand-strong"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              <span className="line-clamp-1 leading-tight">
                {t(item.shortLabelKey ?? item.labelKey)}
              </span>
            </Link>
          </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  );
}
