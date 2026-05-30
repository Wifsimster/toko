import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { LogOut, LifeBuoy, ChevronDown, Lock, UserCog, Compass, Award, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useKoeTrigger } from "@/components/koe-widget";
import { useUiStore } from "@/stores/ui-store";
import { invalidateSessionCache, useSession, signOut } from "@/lib/auth-client";

function handleSignOut() {
  invalidateSessionCache();
  signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
}

export function UserMenu() {
  const { t } = useTranslation();
  const session = useSession();
  const { openKoe, available: koeAvailable } = useKoeTrigger();

  // Better Auth's React client is cast to a generic `ReturnType<typeof createAuthClient>`
  // in auth-client.ts, which drops the inferred additionalFields. Re-narrow here so we
  // can read `isAdmin` (surfaced via `user.additionalFields` on the server).
  const user = session.data?.user as
    | { name: string; email?: string | null; isAdmin?: boolean }
    | undefined;
  if (!user) return null;

  const userInitial = user.name?.trim().charAt(0).toUpperCase() ?? "?";
  const isAdmin = user.isAdmin === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            aria-label={t("nav.userMenu")}
            className="group-data-[collapsible=icon]:px-0"
            data-tour="user-menu"
          />
        }
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {userInitial}
        </span>
        <span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            {isAdmin && (
              <Badge variant="secondary" className="shrink-0">
                {t("nav.admin")}
              </Badge>
            )}
          </span>
          {user.email && (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="right"
        sideOffset={8}
        className="w-60"
      >
        <DropdownMenuLabel>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            {isAdmin && (
              <Badge variant="secondary" className="shrink-0">
                {t("nav.admin")}
              </Badge>
            )}
          </span>
          {user.email && (
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/achievements" />}>
          <Award className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.achievements")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/activity" />}>
          <History className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.activity")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/account" />}>
          <UserCog className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.account")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => useUiStore.getState().resetOnboarding()}>
          <Compass className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.tour")}
        </DropdownMenuItem>
        {koeAvailable && (
          <DropdownMenuItem onClick={openKoe}>
            <LifeBuoy className="size-4 text-muted-foreground" aria-hidden="true" />
            {t("nav.support")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => useUiStore.getState().lock()}>
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.lock")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
