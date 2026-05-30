import { useState } from "react";
import { UserX } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUser } from "@/hooks/use-admin-users";

export function BlockUserDialog({
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
            <UserX className="size-4" aria-hidden="true" />
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
