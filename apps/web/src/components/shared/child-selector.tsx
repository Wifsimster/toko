import { useEffect, useState } from "react";
import { Plus, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useChildren, useCreateChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";

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

  return (
    <div className="flex items-center gap-2">
      <Baby className="h-4 w-4 text-muted-foreground" />
      <Select
        value={activeChildId ?? undefined}
        onValueChange={setActiveChild}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Enfant" />
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              {child.name}
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

function AddChildForm({ onSuccess }: { onSuccess: () => void }) {
  const createChild = useCreateChild();
  const setActiveChild = useUiStore((s) => s.setActiveChild);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [diagnosisType, setDiagnosisType] = useState<string>("mixed");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createChild.mutate(
      {
        name,
        birthDate,
        diagnosisType: diagnosisType as "inattentive" | "hyperactive" | "mixed",
      },
      {
        onSuccess: (data) => {
          setActiveChild(data.id);
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="child-name">Prénom</Label>
        <Input
          id="child-name"
          placeholder="Prénom de l'enfant"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-birth">Date de naissance</Label>
        <Input
          id="child-birth"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-diagnosis">Type de diagnostic</Label>
        <Select value={diagnosisType} onValueChange={setDiagnosisType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inattentive">Inattentif</SelectItem>
            <SelectItem value="hyperactive">Hyperactif</SelectItem>
            <SelectItem value="mixed">Mixte</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createChild.isPending}
      >
        {createChild.isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}
