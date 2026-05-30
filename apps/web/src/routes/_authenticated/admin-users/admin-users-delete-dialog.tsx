import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminUser } from "@/hooks/use-admin-users";

export function DeleteUserDialog({
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
            <Trash2 className="size-4" aria-hidden="true" />
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
