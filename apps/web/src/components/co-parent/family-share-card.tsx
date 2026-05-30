import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChildren } from "@/hooks/use-children";
import { useSession } from "@/lib/auth-client";
import { FamilyInviteDialog } from "./family-invite-dialog";
import { FamilyMembersList } from "./family-members-list";

// Entry point in /account for the simplified "share my whole family" flow.
// Disables the invite CTA if the parent has no owned children yet — sharing
// nothing isn't a useful operation.
export function FamilyShareCard() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const session = useSession();
  const children = useChildren();
  const currentUserId = session.data?.user?.id ?? null;
  const ownedCount =
    children.data?.filter((c) => c.parentId === currentUserId).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4" />
          {t("familyShare.cardTitle")}
        </CardTitle>
        <CardDescription>{t("familyShare.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FamilyMembersList />

        {ownedCount === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            {t("familyShare.noOwnedChildren")}
          </p>
        ) : (
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="gap-1.5"
          >
            <Mail className="size-4" />
            {t("familyShare.inviteCta")}
          </Button>
        )}
      </CardContent>

      <FamilyInviteDialog open={open} onOpenChange={setOpen} />
    </Card>
  );
}
