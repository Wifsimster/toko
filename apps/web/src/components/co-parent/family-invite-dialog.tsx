import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FamilyInviteContent } from "./family-invite-content";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Thin shell: the form lives in <FamilyInviteContent>, mounted only while the
// dialog is open so its state initializes fresh on every open without a reset
// effect.
export function FamilyInviteDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <FamilyInviteContent onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}
