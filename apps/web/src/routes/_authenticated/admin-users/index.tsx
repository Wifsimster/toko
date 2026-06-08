import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useAdminUsers,
} from "@/hooks/use-admin-users";
import { ApiError } from "@/lib/api-client";
import { getCachedSession, useSession } from "@/lib/auth-client";
import { UserCard } from "./admin-users-user-card";
import { UserRow } from "./admin-users-user-row";

export const Route = createFileRoute("/_authenticated/admin-users/")({
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
  component: AdminUsersPage,
  staticData: { crumb: "nav.adminUsers" },
});

function AdminUsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useAdminUsers();
  const session = useSession();
  const currentUserId = session.data?.user?.id;
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  if (isLoading) return <PageLoader />;

  if (error) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="space-y-4">
        <PageHeader title={t("adminUsers.title")} />
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            {forbidden
              ? t("errors.adminOnly")
              : t("errors.usersLoadFailed")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = data ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      )
    : users;
  const adminCount = users.filter((u) => u.isAdmin).length;
  const premiumCount = users.filter((u) => u.premiumGranted).length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("adminUsers.title")}
        description={`${t("adminUsers.summary", {
          count: users.length,
          adminCount,
          premiumCount,
        })}${
          blockedCount > 0
            ? t("adminUsers.summaryBlockedSuffix", { count: blockedCount })
            : ""
        }`}
      />

      <div className="relative max-w-sm">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("adminUsers.searchPlaceholder")}
          aria-label={t("adminUsers.searchAria")}
          className="pl-9 md:pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {query ? t("adminUsers.noMatch") : t("adminUsers.empty")}
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile: a stacked card list. Each card opens a bottom sheet that
        // groups every management action, instead of a wide scrolling table.
        <div className="space-y-3">
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              isCurrentUser={u.id === currentUserId}
            />
          ))}
        </div>
      ) : (
        <Card className="py-0">
          <CardContent className="p-0">
            <Table className="[&_td]:px-3 [&_th]:px-3">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>{t("adminUsers.columns.user")}</TableHead>
                  <TableHead>{t("adminUsers.columns.login")}</TableHead>
                  <TableHead>{t("adminUsers.columns.registeredOn")}</TableHead>
                  <TableHead>{t("adminUsers.columns.subscription")}</TableHead>
                  <TableHead>{t("adminUsers.columns.role")}</TableHead>
                  <TableHead>{t("adminUsers.columns.premium")}</TableHead>
                  <TableHead>{t("adminUsers.columns.account")}</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">
                      {t("adminUsers.columns.actions")}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isCurrentUser={u.id === currentUserId}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
