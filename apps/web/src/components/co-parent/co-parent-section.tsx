import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail, Trash2, Crown, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { useSession } from "@/lib/auth-client";
import {
  useChildAccess,
  useInviteCoParent,
  useRevokeAccess,
  usePendingInvitations,
  useCancelInvitation,
  type ChildAccessRow,
  type PendingInvitation,
} from "@/hooks/use-child-access";
import { RecentActivity } from "@/components/co-parent/recent-activity";

interface Props {
  childId: string;
}

export function CoParentSection({ childId }: Props) {
  const { t } = useTranslation();
  const session = useSession();
  const access = useChildAccess(childId);
  const invite = useInviteCoParent(childId);
  const revoke = useRevokeAccess(childId);
  const [email, setEmail] = useState("");
  const [attested, setAttested] = useState(false);

  const currentUserId = session.data?.user?.id ?? null;
  const myRow = access.data?.find((r) => r.userId === currentUserId) ?? null;
  const isOwner = myRow?.role === "owner";

  const pending = usePendingInvitations(childId, isOwner);
  const cancelInvite = useCancelInvitation(childId);
  const hasOnlyOwner =
    !!access.data && access.data.length === 1 && isOwner;
  const hasPending = (pending.data?.length ?? 0) > 0;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !attested) return;
    invite.mutate(
      { email: trimmed, parentalAuthorityAttestation: true },
      {
        onSuccess: () => {
          setEmail("");
          setAttested(false);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-sm font-semibold">
          {t("childAccess.sectionTitle")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {isOwner
            ? t("childAccess.descriptionOwner")
            : t("childAccess.descriptionCoParent")}
        </p>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            {t("childAccess.tabMembers")}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {t("childAccess.tabActivity")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4 pt-3">
          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-2">
          <Label htmlFor={`co-parent-email-${childId}`} className="text-sm">
            {t("childAccess.inviteLabel")}
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={`co-parent-email-${childId}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("childAccess.invitePlaceholder")}
              className="w-full"
            />
            <Button
              type="submit"
              disabled={invite.isPending || !email.trim() || !attested}
              className="gap-1.5 whitespace-nowrap"
            >
              {invite.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              {t("childAccess.inviteCta")}
            </Button>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
            <Checkbox
              id={`co-parent-attest-${childId}`}
              checked={attested}
              onCheckedChange={(v) => setAttested(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor={`co-parent-attest-${childId}`}
              className="text-xs font-normal leading-relaxed text-muted-foreground"
            >
              {t("childAccess.attestationLabel")}
            </Label>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t("childAccess.consentNoticeShort")}{" "}
            {t("childAccess.controllerNotice")}
          </p>
        </form>
      )}

          {isOwner && hasPending && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("childAccess.pendingTitle")}
              </p>
              <ul className="space-y-2">
                {pending.data?.map((row) => (
                  <PendingRow
                    key={row.id}
                    row={row}
                    onCancel={() => cancelInvite.mutate(row.id)}
                    cancelPending={cancelInvite.isPending}
                  />
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("childAccess.membersTitle")}
            </p>
            {access.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <ul className="space-y-2">
                  {access.data?.map((row) => (
                    <MemberRow
                      key={row.id}
                      row={row}
                      isViewerOwner={isOwner}
                      viewerUserId={currentUserId}
                      onRevoke={() => revoke.mutate(row.userId)}
                      revokePending={revoke.isPending}
                    />
                  ))}
                </ul>
                {hasOnlyOwner && !hasPending && (
                  <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                    {t("childAccess.noCoParentYet")}
                  </p>
                )}
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="activity" className="pt-3">
          <RecentActivity childId={childId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PendingRowProps {
  row: PendingInvitation;
  onCancel: () => void;
  cancelPending: boolean;
}

function PendingRow({ row, onCancel, cancelPending }: PendingRowProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const expiry = new Date(row.expiresAt).toLocaleDateString(
    i18nInstance.language || "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Clock className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.invitedEmail}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("childAccess.pendingExpires", { date: expiry })}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={cancelPending}
        aria-label={t("childAccess.pendingCancelAria", {
          email: row.invitedEmail,
        })}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        {cancelPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          t("childAccess.pendingCancel")
        )}
      </Button>
    </li>
  );
}

interface MemberRowProps {
  row: ChildAccessRow;
  isViewerOwner: boolean;
  viewerUserId: string | null;
  onRevoke: () => void;
  revokePending: boolean;
}

function MemberRow({
  row,
  isViewerOwner,
  viewerUserId,
  onRevoke,
  revokePending,
}: MemberRowProps) {
  const { t } = useTranslation();
  const isSelf = row.userId === viewerUserId;
  const canRevoke = isViewerOwner && !isSelf && row.role === "co_parent";

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {row.role === "owner" ? (
            <Crown className="size-4" />
          ) : (
            <User className="size-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {row.userName ?? row.userEmail}
            {isSelf && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({t("childAccess.you")})
              </span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.userEmail}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={row.role === "owner" ? "default" : "outline"}>
          {row.role === "owner"
            ? t("childAccess.roleOwner")
            : t("childAccess.roleCoParent")}
        </Badge>
        {canRevoke && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={revokePending}
                  aria-label={t("childAccess.revokeAria", {
                    name: row.userName ?? row.userEmail,
                  })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("childAccess.revokeConfirmTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("childAccess.revokeConfirmDescription", {
                    name: row.userName ?? row.userEmail,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("child.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onRevoke}>
                  {t("childAccess.revokeConfirmAction")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </li>
  );
}
