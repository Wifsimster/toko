import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShareDialogContent } from "./share-dialog-content";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleSlug: string;
  articleTitle: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  articleSlug,
  articleTitle,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <ShareDialogContent
            articleSlug={articleSlug}
            articleTitle={articleTitle}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

