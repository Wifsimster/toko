import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail, Trash2, Crown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import {
  useChildAccess,
  useInviteCoParent,
  useRevokeAccess,
  type ChildAccessRow,
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

  const currentUserId = session.data?.user?.id ?? null;
  const myRow = access.data?.find((r) => r.userId === currentUserId) ?? null;
  const isOwner = myRow?.role === "owner";

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    invite.mutate(trimmed, {
      onSuccess: () => setEmail(""),
    });
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
              disabled={invite.isPending || !email.trim()}
              className="gap-1.5 whitespace-nowrap"
            >
              {invite.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {t("childAccess.inviteCta")}
            </Button>
          </div>
        </form>
      )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("childAccess.membersTitle")}
            </p>
            {access.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {row.role === "owner" ? (
            <Crown className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRevoke}
            disabled={revokePending}
            aria-label={t("childAccess.revokeAria", {
              name: row.userName ?? row.userEmail,
            })}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </li>
  );
}
