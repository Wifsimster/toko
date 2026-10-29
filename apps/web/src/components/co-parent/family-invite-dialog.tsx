import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FamilyInviteContent } from "./family-invite-content";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyInviteDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <FamilyInviteContent onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}
