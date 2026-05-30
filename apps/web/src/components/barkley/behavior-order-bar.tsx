import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BehaviorOrderBarProps {
  isPending: boolean;
  cancelLabel: string;
  saveLabel: string;
  savingLabel: string;
  onCancel: () => void;
  onSave: () => void;
}

export function BehaviorOrderBar({
  isPending,
  cancelLabel,
  saveLabel,
  savingLabel,
  onCancel,
  onSave,
}: BehaviorOrderBarProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="ghost" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button size="sm" onClick={onSave} disabled={isPending}>
        <Save className="mr-1.5 size-3.5" />
        {isPending ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
