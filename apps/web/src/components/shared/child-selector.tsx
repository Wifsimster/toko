import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getChildEmoji, formatChildAge } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChildren } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import { AddChildForm } from "@/components/shared/add-child-form";

export function ChildSelector() {
  const { data: children, isLoading } = useChildren();
  const { activeChildId, setActiveChild } = useUiStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Auto-select first child if none is selected
  useEffect(() => {
    if (!activeChildId && children?.length) {
      setActiveChild(children[0]!.id);
    }
  }, [activeChildId, children, setActiveChild]);

  if (isLoading) return null;

  if (!children?.length) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger
          render={
            <Button size="sm" variant="outline">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Ajouter un enfant
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter votre enfant</DialogTitle>
          </DialogHeader>
          <AddChildForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  const selectedChild = children?.find((c) => c.id === activeChildId);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeChildId ?? undefined}
        onValueChange={(v) => v && setActiveChild(v)}
      >
        <SelectTrigger className="w-auto min-w-36 max-w-52">
          <SelectValue placeholder="Enfant">
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">{getChildEmoji(selectedChild?.gender)}</span>
              <span className="truncate">{selectedChild?.name}</span>
              {selectedChild?.birthDate && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatChildAge(selectedChild.birthDate)}
                </span>
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id} label={child.name}>
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{getChildEmoji(child.gender)}</span>
                <span>{child.name}</span>
                {child.birthDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatChildAge(child.birthDate)}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger
          render={
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un enfant</DialogTitle>
          </DialogHeader>
          <AddChildForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
