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
import { Button } from "@/components/ui/button";

export function ConfirmAction({
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
            <Icon className="size-4" aria-hidden="true" />
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
