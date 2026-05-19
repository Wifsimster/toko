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
  Trash2,
  RotateCcw,
  MailCheck,
  MailWarning,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useAdminUsers,
  useBlockUser,
  useCancelUserDeletion,
  useResetUserPassword,
  useScheduleUserDeletion,
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

// A scheduled account is erased once the 30-day grace period elapses.
// The admin cares about that erasure date, not the scheduling timestamp.
const DELETION_GRACE_DAYS = 30;

function scheduledDeletionDate(scheduledAtIso: string): string {
  const d = new Date(scheduledAtIso);
  d.setDate(d.getDate() + DELETION_GRACE_DAYS);
  return formatDate(d.toISOString());
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

// Maps a Better Auth provider id to a human label.
function signInMethodLabel(providerId: string): string {
  switch (providerId) {
    case "credential":
      return "Mot de passe";
    case "google":
      return "Google";
    default:
      return providerId;
  }
}

// Read-only Better Auth account details: how the user signs in and
// whether their e-mail address has been verified.
function AuthInfo({ user }: { user: AdminUser }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap gap-1">
        {user.authProviders.length > 0 ? (
          user.authProviders.map((p) => (
            <Badge key={p} variant="outline">
              {signInMethodLabel(p)}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            Aucune méthode
          </span>
        )}
      </div>
      {user.emailVerified ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
          E-mail vérifié
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-500">
          <MailWarning className="h-3.5 w-3.5" aria-hidden="true" />
          E-mail non vérifié
        </span>
      )}
    </div>
  );
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

      <div className="relative flex max-w-sm items-center">
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

// Deletion confirmation. Scheduling an erasure is high-stakes even with
// the 30-day grace, so the confirm button stays locked until the admin
// retypes the account's e-mail — a deliberate guard against a misclick.
function DeleteUserDialog({
  user,
  disabled,
  onConfirm,
  fullWidth,
}: {
  user: AdminUser;
  disabled?: boolean;
  onConfirm: () => void;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const emailId = `delete-confirm-${user.id}`;
  const matches =
    confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmEmail("");
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
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Programmer la suppression
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le compte de {user.name}</DialogTitle>
          <DialogDescription>
            Le compte et toutes ses données (enfants, suivis, journal) seront
            définitivement supprimés dans 30 jours. Vous pourrez annuler cette
            suppression à tout moment pendant ce délai.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={emailId}>
            Tapez l'adresse e-mail du compte pour confirmer
          </Label>
          <Input
            id={emailId}
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={user.email}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Annuler</Button>} />
          <Button
            variant="destructive"
            disabled={!matches}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Programmer la suppression
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
      <div className="mt-1 w-full border-t border-border/60 pt-3">
        <DeletionControl
          user={user}
          isCurrentUser={isCurrentUser}
          fullWidth={fullWidth}
        />
      </div>
    </div>
  );
}

// Account-deletion badge + the schedule/cancel action. Deletion is a
// 30-day scheduled erasure (reversible during the grace period), kept
// fenced off below the reversible account actions above. Administrator
// accounts — and your own — can't be deleted here: an admin must be
// demoted first, which keeps the last admin from being removed by error.
function DeletionControl({
  user,
  isCurrentUser,
  fullWidth,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  fullWidth?: boolean;
}) {
  const scheduleDeletion = useScheduleUserDeletion();
  const cancelDeletion = useCancelUserDeletion();
  const pending =
    (scheduleDeletion.isPending && scheduleDeletion.variables === user.id) ||
    (cancelDeletion.isPending && cancelDeletion.variables === user.id);

  return (
    <div className="flex flex-col items-start gap-1.5">
      {user.deletionScheduledAt ? (
        <>
          <Badge variant="destructive">Suppression programmée</Badge>
          <span className="text-xs text-muted-foreground">
            Compte supprimé le{" "}
            {scheduledDeletionDate(user.deletionScheduledAt)}
          </span>
          <ConfirmAction
            fullWidth={fullWidth}
            buttonLabel="Annuler la suppression"
            buttonIcon={RotateCcw}
            buttonVariant="outline"
            disabled={pending}
            title="Annuler la suppression du compte"
            description={`Le compte de ${user.name} ne sera pas supprimé et restera actif.`}
            confirmLabel="Annuler la suppression"
            onConfirm={() => cancelDeletion.mutate(user.id)}
          />
        </>
      ) : isCurrentUser ? (
        <span className="text-xs text-muted-foreground">
          Vous ne pouvez pas supprimer votre propre compte
        </span>
      ) : user.isAdmin ? (
        <span className="text-xs text-muted-foreground">
          Les comptes administrateurs ne peuvent pas être supprimés
        </span>
      ) : (
        <DeleteUserDialog
          user={user}
          fullWidth={fullWidth}
          disabled={pending}
          onConfirm={() => scheduleDeletion.mutate(user.id)}
        />
      )}
    </div>
  );
}

function UserRow({
  user,
  isCurrentUser,
}: {
  user: AdminUser;
  isCurrentUser: boolean;
}) {
  const sub = subscriptionBadge(user);

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-foreground">
          {user.name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (vous)
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </TableCell>
      <TableCell>
        <AuthInfo user={user} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <Badge variant={sub.variant}>{sub.label}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.isAdmin ? "secondary" : "outline"}>
          {user.isAdmin ? "Administrateur" : "Parent"}
        </Badge>
      </TableCell>
      <TableCell>
        {user.premiumGranted ? (
          <Badge variant="default">Premium accordé</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Non accordé</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          {user.deletionScheduledAt && (
            <Badge variant="destructive">Suppression programmée</Badge>
          )}
          {user.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
          {!user.deletionScheduledAt && !user.isBlocked && (
            <Badge variant="outline">Actif</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <ManageUserSheet
          user={user}
          isCurrentUser={isCurrentUser}
          side="right"
        />
      </TableCell>
    </TableRow>
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

// Every per-user action grouped in a single sheet so only one decision is
// shown at a time. The mobile card opens it from the bottom; a desktop
// table row opens it from the right.
function ManageUserSheet({
  user,
  isCurrentUser,
  side = "bottom",
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  side?: "bottom" | "right";
}) {
  const desktop = side === "right";
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size={desktop ? "sm" : "default"}
            className={desktop ? undefined : "w-full"}
          >
            <UserCog className="h-4 w-4" aria-hidden="true" />
            Gérer le compte
          </Button>
        }
      />
      <SheetContent side={side} className="gap-0 overflow-y-auto">
        <SheetHeader className="pr-10">
          <SheetTitle>{user.name}</SheetTitle>
          <SheetDescription className="break-all">
            {user.email}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-4">
          <SheetSection label="Connexion">
            <AuthInfo user={user} />
          </SheetSection>
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

// A labelled status row for the mobile card. The desktop table conveys
// each badge's meaning through a column header; the stacked card has none,
// so every badge gets an explicit label to the left of it.
function CardField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap justify-end gap-1.5">{children}</div>
    </div>
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
        <div className="space-y-2 border-t border-border/60 pt-3">
          <CardField label="Abonnement">
            <Badge variant={sub.variant}>{sub.label}</Badge>
          </CardField>
          <CardField label="Rôle">
            <Badge variant={user.isAdmin ? "secondary" : "outline"}>
              {user.isAdmin ? "Administrateur" : "Parent"}
            </Badge>
          </CardField>
          <CardField label="Accès premium">
            {user.premiumGranted ? (
              <Badge variant="default">Premium accordé</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Non accordé</span>
            )}
          </CardField>
          <CardField label="Compte">
            {user.isBlocked && <Badge variant="destructive">Bloqué</Badge>}
            {user.deletionScheduledAt && (
              <Badge variant="destructive">Suppression programmée</Badge>
            )}
            {!user.isBlocked && !user.deletionScheduledAt && (
              <Badge variant="outline">Actif</Badge>
            )}
          </CardField>
        </div>
        <AuthInfo user={user} />
        <p className="text-xs text-muted-foreground">
          Inscrit le {formatDate(user.createdAt)}
        </p>
        <ManageUserSheet user={user} isCurrentUser={isCurrentUser} />
      </CardContent>
    </Card>
  );
}
