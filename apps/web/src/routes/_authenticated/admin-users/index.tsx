import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ShieldOff, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  useAdminUsers,
  useUpdateUserRole,
  type AdminUser,
} from "@/hooks/use-admin-users";
import { ApiError } from "@/lib/api-client";
import { getCachedSession, useSession } from "@/lib/auth-client";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AdminUsersPage() {
  const { data, isLoading, error } = useAdminUsers();
  const session = useSession();
  const currentUserId = session.data?.user?.id;
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration des utilisateurs"
        description={`${users.length} compte${
          users.length > 1 ? "s" : ""
        } · ${adminCount} administrateur${adminCount > 1 ? "s" : ""}`}
      />

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou e-mail"
          aria-label="Rechercher un utilisateur"
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {query
                ? "Aucun utilisateur ne correspond à votre recherche."
                : "Aucun utilisateur pour le moment."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Inscrit le
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      isCurrentUser={u.id === currentUserId}
                      striped={i % 2 === 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({
  user,
  isCurrentUser,
  striped,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  striped: boolean;
}) {
  const updateRole = useUpdateUserRole();
  const isPending =
    updateRole.isPending && updateRole.variables?.id === user.id;
  // Mirrors the API guard: an admin can't strip their own role.
  const lockedSelf = isCurrentUser && user.isAdmin;

  return (
    <tr className={striped ? "bg-muted/20" : undefined}>
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">
          {user.name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (vous)
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={user.isAdmin ? "secondary" : "outline"}>
            {user.isAdmin ? "Administrateur" : "Parent"}
          </Badge>
          {user.deletionScheduledAt && (
            <Badge variant="destructive">Suppression programmée</Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        {lockedSelf ? (
          <span className="text-xs text-muted-foreground">
            Vous ne pouvez pas modifier votre propre rôle
          </span>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant={user.isAdmin ? "destructive" : "outline"}
                  size="sm"
                  disabled={isPending}
                >
                  {user.isAdmin ? (
                    <>
                      <ShieldOff className="h-4 w-4" aria-hidden="true" />
                      Retirer l'accès admin
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Rendre administrateur
                    </>
                  )}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirmer le changement de rôle
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {user.isAdmin
                    ? `${user.name} perdra l'accès aux pages d'administration.`
                    : `${user.name} aura accès à toutes les pages d'administration, y compris la gestion des utilisateurs.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    updateRole.mutate({
                      id: user.id,
                      isAdmin: !user.isAdmin,
                    })
                  }
                >
                  {user.isAdmin
                    ? "Retirer l'accès admin"
                    : "Rendre administrateur"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </td>
    </tr>
  );
}
