import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
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
        <PageHeader title="Administration des utilisateurs" />
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            {forbidden
              ? "Cette page est réservée aux administrateurs."
              : "Impossible de charger la liste des utilisateurs pour le moment."}
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
        title="Administration des utilisateurs"
        description={`${users.length} compte${
          users.length > 1 ? "s" : ""
        } · ${adminCount} administrateur${
          adminCount > 1 ? "s" : ""
        } · ${premiumCount} accès premium accordé${
          premiumCount > 1 ? "s" : ""
        }${
          blockedCount > 0
            ? ` · ${blockedCount} compte${
                blockedCount > 1 ? "s" : ""
              } bloqué${blockedCount > 1 ? "s" : ""}`
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
          placeholder="Rechercher par nom ou e-mail"
          aria-label="Rechercher un utilisateur"
          className="pl-9 md:pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {query
              ? "Aucun utilisateur ne correspond à votre recherche."
              : "Aucun utilisateur pour le moment."}
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
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Connexion</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Accès premium</TableHead>
                  <TableHead>Compte</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
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
