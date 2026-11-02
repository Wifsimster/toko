import { useTranslation } from "react-i18next";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChildSelector } from "@/components/shared/child-selector";
import { UserMenu } from "@/components/layout/user-menu";
import { AndroidAppPromo } from "@/components/layout/android-app-promo";
import { useSession } from "@/lib/auth-client";
import { MORE_GROUPS } from "@focusflow/validators";
import { adminNavItems, matchesPath, moreItems, navItems, type NavItem } from "@/config/nav";
import { markQuizOpenedFromApp } from "@/lib/quiz-origin";

const todayItem = navItems.find((i) => i.to === "/dashboard") as NavItem;

const baseSections = [
  { key: "main", labelKey: "nav.groupMain", items: [todayItem] },
  ...MORE_GROUPS.map((g) => ({
    key: g.key,
    labelKey: g.labelKey,
    items: g.ids.map((id) => moreItems[id]),
  })),
];

export function AppSidebar() {
  const { t } = useTranslation();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useSession();
  const isAdmin =
    (session.data?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true;

  const sections = isAdmin
    ? [...baseSections, { key: "admin", labelKey: "nav.groupAdmin", items: adminNavItems }]
    : baseSections;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link
          to="/dashboard"
          onClick={() => setOpenMobile(false)}
          aria-label={t("nav.dashboard")}
          className="flex h-10 items-center gap-2 rounded-md px-2 text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <BrandLogo className="size-7 rounded-lg shadow-sm" />
          <span className="font-wordmark text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Tokō
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
          <ChildSelector />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.key}>
            <SidebarGroupLabel>{t(section.labelKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = matchesPath(pathname, item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={t(item.labelKey)}
                        render={
                          <Link
                            to={item.to}
                            onClick={() => {
                              if (item.to === "/quiz") markQuizOpenedFromApp();
                              setOpenMobile(false);
                            }}
                            aria-current={isActive ? "page" : undefined}
                          />
                        }
                      >
                        <item.icon />
                        <span>{t(item.labelKey)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <AndroidAppPromo />
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
