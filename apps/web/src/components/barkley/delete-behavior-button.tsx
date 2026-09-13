import { useTranslation } from "react-i18next";
import {
  Trash2,
} from "lucide-react";
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

export function DeleteBehaviorButton({
  name,
  onDelete,
  pending,
  className,
}: {
  name: string;
  onDelete: () => void;
  pending: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            disabled={pending}
            aria-label={t("behaviorTracking.deleteAria", { name })}
            className={className}
          >
            <Trash2 className="size-3.5" />
          </button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("behaviorTracking.deleteTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("behaviorTracking.deleteBody", { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("child.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>
            {t("child.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
