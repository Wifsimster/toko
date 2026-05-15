import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Crown,
  Ban,
  Search,
  KeyRound,
  UserCheck,
  UserX,
  UserCog,
} from "lucide-react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useAdminUsers,
  useBlockUser,
  useResetUserPassword,
  useUpdateUserPremium,
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

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Maps the user's Stripe subscription state to a read-only badge.
function subscriptionBadge(u: AdminUser): {
  label: string;
  variant: BadgeVariant;
} {
  const status = u.subscriptionStatus;
  if (!status) return { label: "Aucun", variant: "outline" };

  const paused =
    u.subscriptionPausedUntil != null &&
    new Date(u.subscriptionPausedUntil) > new Date();
  if (paused) return { label: "En pause", variant: "outline" };

  switch (status) {
    case "active":
      return u.subscriptionCancelAtPeriodEnd
        ? { label: "Annulation prévue", variant: "outline" }
        : { label: "Abonné", variant: "secondary" };
    case "trialing":
      return { label: "Essai", variant: "secondary" };
    case "past_due":
    case "unpaid":
      return { label: "Paiement en retard", variant: "destructive" };
    case "canceled":
      return { label: "Annulé", variant: "outline" };
    default:
      return { label: "Inactif", variant: "outline" };
  }
}

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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[72rem] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Inscrit le
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Abonnement
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Accès premium
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Compte
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ConfirmAction({
  buttonLabel,
  buttonIcon: Icon,
  buttonVariant,
  disabled,
  title,
  description,
  confirmLabel,
  onConfirm,
  fullWidth,
}: {
  buttonLabel: string;
  buttonIcon: React.ComponentType<{ className?: string }>;
  buttonVariant: "outline" | "destructive";
  disabled?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  fullWidth?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant={buttonVariant}
            size={fullWidth ? "default" : "sm"}
            disabled={disabled}
            className={fullWidth ? "w-full" : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {buttonLabel}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Block confirmation needs a free-text field, so it uses a Dialog rather
// than the input-less ConfirmAction.
function BlockUserDialog({
  user,
  disabled,
  onConfirm,
  fullWidth,
}: {
  user: AdminUser;
  disabled?: boolean;
  onConfirm: (reason: string) => void;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = `block-reason-${user.id}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setReason("");
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size={fullWidth ? "default" : "sm"}
            disabled={disabled}
            className={fullWidth ? "w-full" : undefined}
          >
            <UserX className="h-4 w-4" aria-hidden="true" />
            Bloquer le compte
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquer {user.name}</DialogTitle>
          <DialogDescription>
            {user.name} sera immédiatement déconnecté et ne pourra plus se
            connecter à Tokō. Vous pourrez débloquer le compte à tout moment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={reasonId}>Motif (facultatif)</Label>
          <Textarea
            id={reasonId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex. : demande de l'utilisateur, comportement inapproprié…"
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Ce motif n'est visible que par les administrateurs.
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Annuler</Button>} />
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(reason.trim());
              setOpen(false);
            }}
          >
            Bloquer le compte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Role badge + the grant/revoke action. Shared by the desktop table cell
// and the mobile management sheet — `fullWidth` switches the button sizing.
function RoleControl({
  user,
  isCurrentUser,
  fullWidth,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  fullWidth?: boolean;
}) {
  const updateRole = useUpdateUserRole();
  const rolePending =
    updateRole.isPending && updateRole.variables?.id === user.id;
  // Mirrors the API guard: an admin can't strip their own role.
  const lockedSelf = isCurrentUser && user.isAdmin;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Badge variant={user.isAdmin ? "secondary" : "outline"}>
        {user.isAdmin ? "Administrateur" : "Parent"}
      </Badge>
      {lockedSelf ? (
        <span className="text-xs text-muted-foreground">
          Vous ne pouvez pas modifier votre propre rôle
        </span>
      ) : user.isAdmin ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Retirer l'accès admin"
          buttonIcon={ShieldOff}
          buttonVariant="destructive"
          disabled={rolePending}
          title="Confirmer le changement de rôle"
          description={`${user.name} perdra l'accès aux pages d'administration.`}
          confirmLabel="Retirer l'accès admin"
          onConfirm={() => updateRole.mutate({ id: user.id, isAdmin: false })}
        />
      ) : (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Rendre administrateur"
          buttonIcon={ShieldCheck}
          buttonVariant="outline"
          disabled={rolePending}
          title="Confirmer le changement de rôle"
          description={`${user.name} aura accès à toutes les pages d'administration, y compris la gestion des utilisateurs.`}
          confirmLabel="Rendre administrateur"
          onConfirm={() => updateRole.mutate({ id: user.id, isAdmin: true })}
        />
      )}
    </div>
  );
}

// Premium-access badge + the grant/revoke action.
function PremiumControl({
  user,
  fullWidth,
}: {
  user: AdminUser;
  fullWidth?: boolean;
}) {
  const updatePremium = useUpdateUserPremium();
  const premiumPending =
    updatePremium.isPending && updatePremium.variables?.id === user.id;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.premiumGranted ? (
        <Badge variant="default">Premium accordé</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Non accordé</span>
      )}
      {user.premiumGranted ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Retirer le premium"
          buttonIcon={Ban}
          buttonVariant="destructive"
          disabled={premiumPending}
          title="Retirer l'accès premium"
          description={`${user.name} perdra l'accès premium accordé. Son accès dépendra alors de son abonnement Stripe.`}
          confirmLabel="Retirer le premium"
          onConfirm={() =>
            updatePremium.mutate({ id: user.id, premiumGranted: false })
          }
        />
      ) : (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Accorder le premium"
          buttonIcon={Crown}
          buttonVariant="outline"
          disabled={premiumPending}
          title="Accorder l'accès premium"
          description={`${user.name} aura un accès premium complet et gratuit, indépendamment de tout abonnement Stripe.`}
          confirmLabel="Accorder le premium"
          onConfirm={() =>
            updatePremium.mutate({ id: user.id, premiumGranted: true })
          }
        />
      )}
    </div>
  );
}

// Account-status badge + the block/unblock and password-reset actions.
function AccountControl({
  user,
  isCurrentUser,
  fullWidth,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  fullWidth?: boolean;
}) {
  const blockUser = useBlockUser();
  const resetPassword = useResetUserPassword();
  const blockPending =
    blockUser.isPending && blockUser.variables?.id === user.id;
  const resetPending =
    resetPassword.isPending && resetPassword.variables === user.id;

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.isBlocked ? (
        <>
          <Badge variant="destructive">Bloqué</Badge>
          {user.blockedReason && (
            <span className="max-w-[16rem] text-xs text-muted-foreground">
              {user.blockedReason}
            </span>
          )}
        </>
      ) : (
        <Badge variant="outline">Actif</Badge>
      )}
      {isCurrentUser ? (
        <span className="text-xs text-muted-foreground">
          Vous ne pouvez pas bloquer votre propre compte
        </span>
      ) : user.isBlocked ? (
        <ConfirmAction
          fullWidth={fullWidth}
          buttonLabel="Débloquer le compte"
          buttonIcon={UserCheck}
          buttonVariant="outline"
          disabled={blockPending}
          title="Débloquer ce compte"
          description={`${user.name} pourra de nouveau se connecter et utiliser Tokō.`}
          confirmLabel="Débloquer le compte"
          onConfirm={() => blockUser.mutate({ id: user.id, isBlocked: false })}
        />
      ) : (
        <BlockUserDialog
          user={user}
          fullWidth={fullWidth}
          disabled={blockPending}
          onConfirm={(reason) =>
            blockUser.mutate({
              id: user.id,
              isBlocked: true,
              reason: reason || undefined,
            })
          }
        />
      )}
      <ConfirmAction
        fullWidth={fullWidth}
        buttonLabel="Réinitialiser le mot de passe"
        buttonIcon={KeyRound}
        buttonVariant="outline"
        disabled={resetPending}
        title="Réinitialiser le mot de passe"
        description={`Un e-mail sera envoyé à ${user.email} avec un lien pour choisir un nouveau mot de passe. Le lien est valable 1 heure.`}
        confirmLabel="Envoyer le lien"
        onConfirm={() => resetPassword.mutate(user.id)}
      />
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
  const sub = subscriptionBadge(user);

  return (
    <tr className={striped ? "bg-muted/20" : undefined}>
      <td className="px-4 py-3 align-top">
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
      <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={sub.variant}>{sub.label}</Badge>
          {user.deletionScheduledAt && (
            <Badge variant="destructive">Suppression programmée</Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <RoleControl user={user} isCurrentUser={isCurrentUser} />
      </td>
      <td className="px-4 py-3 align-top">
        <PremiumControl user={user} />
      </td>
      <td className="px-4 py-3 align-top">
        <AccountControl user={user} isCurrentUser={isCurrentUser} />
      </td>
    </tr>
  );
}

function SheetSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      {children}
    </section>
  );
}

// Mobile-only: every per-user action grouped in a bottom sheet so the
// touch targets stay large and only one decision is shown at a time.
function ManageUserSheet({
  user,
  isCurrentUser,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="w-full">
            <UserCog className="h-4 w-4" aria-hidden="true" />
            Gérer le compte
          </Button>
        }
      />
      <SheetContent side="bottom" className="gap-0 overflow-y-auto">
        <SheetHeader className="pr-10">
          <SheetTitle>{user.name}</SheetTitle>
          <SheetDescription className="break-all">
            {user.email}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-4">
          <SheetSection label="Rôle">
            <RoleControl user={user} isCurrentUser={isCurrentUser} fullWidth />
          </SheetSection>
          <SheetSection label="Accès premium">
            <PremiumControl user={user} fullWidth />
          </SheetSection>
          <SheetSection label="Compte">
            <AccountControl
              user={user}
              isCurrentUser={isCurrentUser}
              fullWidth
            />
          </SheetSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UserCard({
  user,
  isCurrentUser,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
}) {
  const sub = subscriptionBadge(user);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="min-w-0">
          <div className="font-medium text-foreground">
            {user.name}
            {isCurrentUser && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                (vous)
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground break-all">
            {user.email}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={sub.variant}>{sub.label}</Badge>
          <Badge variant={user.isAdmin ? "secondary" : "outline"}>
            {user.isAdmin ? "Administrateur" : "Parent"}
          </Badge>
          {user.premiumGranted && (
            <Badge variant="default">Premium accordé</Badge>
          )}
          {user.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
          {user.deletionScheduledAt && (
            <Badge variant="destructive">Suppression programmée</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Inscrit le {formatDate(user.createdAt)}
        </p>
        <ManageUserSheet user={user} isCurrentUser={isCurrentUser} />
      </CardContent>
    </Card>
  );
}
