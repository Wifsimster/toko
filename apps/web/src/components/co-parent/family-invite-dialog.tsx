import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInviteFamily } from "@/hooks/use-child-access";
import { useChildren } from "@/hooks/use-children";
import { useSession } from "@/lib/auth-client";
import type { Child } from "@focusflow/validators";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Two-step dialog: (1) email, (2) child selection + attestation.
// Following the UX agent's spec: one action per screen, all children checked
// by default, no granular permissions surface.
export function FamilyInviteDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const session = useSession();
  const children = useChildren();
  const invite = useInviteFamily();
  const currentUserId = session.data?.user?.id ?? null;

  const ownedChildren: Child[] =
    children.data?.filter((c) => c.parentId === currentUserId) ?? [];

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [attested, setAttested] = useState(false);

  // Reset state every time the dialog opens / closes so a re-opening doesn't
  // surface stale email / selection from the previous invite attempt.
  useEffect(() => {
    if (open) {
      setStep(1);
      setEmail("");
      setAttested(false);
      setSelectedIds(new Set(ownedChildren.map((c) => c.id)));
    }
    // ownedChildren ids set is derived; ESLint deps OK to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleChild = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const trimmedEmail = email.trim();
  const canGoToStep2 = trimmedEmail.length > 0 && /.+@.+\..+/.test(trimmedEmail);
  const canSubmit = selectedIds.size > 0 && attested;

  const handleSubmit = () => {
    if (!canSubmit) return;
    invite.mutate(
      {
        email: trimmedEmail,
        childIds: Array.from(selectedIds),
        parentalAuthorityAttestation: true,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? t("familyShare.dialogTitle")
              : t("familyShare.dialogStep2Title")}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? t("familyShare.dialogStep1Description")
              : t("familyShare.dialogStep2Description")}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-3">
            <Label htmlFor="family-invite-email">
              {t("familyShare.emailLabel")}
            </Label>
            <Input
              id="family-invite-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("familyShare.emailPlaceholder")}
              autoFocus
            />
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2">
              {ownedChildren.map((child) => {
                const checked = selectedIds.has(child.id);
                return (
                  <li
                    key={child.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                  >
                    <Checkbox
                      id={`family-share-child-${child.id}`}
                      checked={checked}
                      onCheckedChange={(v) => toggleChild(child.id, v === true)}
                    />
                    <Label
                      htmlFor={`family-share-child-${child.id}`}
                      className="flex-1 cursor-pointer text-sm font-medium"
                    >
                      {child.name}
                    </Label>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <Checkbox
                id="family-invite-attest"
                checked={attested}
                onCheckedChange={(v) => setAttested(v === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="family-invite-attest"
                className="text-xs font-normal leading-relaxed text-muted-foreground"
              >
                {t("familyShare.attestationLabel")}
              </Label>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("childAccess.consentNoticeShort")}{" "}
              {t("childAccess.controllerNotice")}
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t("child.cancel")}
              </Button>
              <Button
                type="button"
                disabled={!canGoToStep2}
                onClick={() => setStep(2)}
              >
                {t("familyShare.nextStep")}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={invite.isPending}
              >
                {t("familyShare.back")}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || invite.isPending}
                className="gap-1.5"
              >
                {invite.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                {t("familyShare.send")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
