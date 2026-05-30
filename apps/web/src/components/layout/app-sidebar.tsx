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
import { useSession } from "@/lib/auth-client";
import { navGroups, navItems } from "@/config/nav";

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useSession();
  const isAdmin =
    (session.data?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true;

  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const buildDateObj = new Date(__BUILD_DATE__);
  const buildDate = buildDateObj.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const buildTime = buildDateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

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
          <span className="font-heading text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Tokō
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
          <ChildSelector />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const items = navItems.filter(
            (i) => i.group === group.key && (!i.requiresAdmin || isAdmin),
          );
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.key}>
              <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive =
                      pathname === item.to || pathname.startsWith(`${item.to}/`);
                    return (
                      <SidebarMenuItem key={item.to} data-tour={item.to}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={t(item.labelKey)}
                          render={
                            <Link
                              to={item.to}
                              onClick={() => setOpenMobile(false)}
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
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <UserMenu />
        <div className="px-2 text-[0.6875rem] leading-tight text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p>v{__APP_VERSION__}</p>
          <p>{t("nav.buildAt", { date: buildDate, time: buildTime })}</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
