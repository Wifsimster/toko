import { useEffect, useState } from "react";
import { Plus, Baby, Shuffle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        onValueChange={(v) => v && setActiveChild(v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Enfant">
            {children.find((c) => c.id === activeChildId)?.name ?? "Enfant"}
          </SelectValue>
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

const RANDOM_FIRSTNAMES = [
  "Petit Loup", "Étoile", "Chouette", "Papillon", "Ourson",
  "Luciole", "Panda", "Colibri", "Renardeau", "Coccinelle",
  "Doudou", "Câlin", "Perle", "Nuage", "Soleil",
];

function getRandomFirstname() {
  return RANDOM_FIRSTNAMES[Math.floor(Math.random() * RANDOM_FIRSTNAMES.length)]!;
}

function AddChildForm({ onSuccess }: { onSuccess: () => void }) {
  const createChild = useCreateChild();
  const setActiveChild = useUiStore((s) => s.setActiveChild);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<string>("");
  const [diagnosisType, setDiagnosisType] = useState<string>("undefined");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createChild.mutate(
      {
        name,
        birthDate,
        ...(gender && { gender: gender as "male" | "female" | "other" }),
        diagnosisType: diagnosisType as "inattentive" | "hyperactive" | "mixed" | "undefined",
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
        <div className="flex gap-2">
          <Input
            id="child-name"
            placeholder="Prénom de l'enfant"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setName(getRandomFirstname())}
                />
              }
            >
              <Shuffle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              Générer un surnom aléatoire pour protéger la vie privée de votre enfant
            </TooltipContent>
          </Tooltip>
        </div>
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
        <Label htmlFor="child-gender">Genre</Label>
        <Select value={gender} onValueChange={(v) => v && setGender(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Non renseigné" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Garçon</SelectItem>
            <SelectItem value="female">Fille</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-diagnosis">Type de diagnostic</Label>
        <Select value={diagnosisType} onValueChange={(v) => v && setDiagnosisType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">Non défini</SelectItem>
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
