import { useState } from "react";
import { Shuffle } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateChild, useUpdateChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";
import type { Child } from "@focusflow/validators";

const RANDOM_FIRSTNAMES = [
  "Petit Loup", "Étoile", "Chouette", "Papillon", "Ourson",
  "Luciole", "Panda", "Colibri", "Renardeau", "Coccinelle",
  "Doudou", "Câlin", "Perle", "Nuage", "Soleil",
];

function getRandomFirstname() {
  return RANDOM_FIRSTNAMES[Math.floor(Math.random() * RANDOM_FIRSTNAMES.length)]!;
}

type Gender = "male" | "female" | "other";
type DiagnosisType = "inattentive" | "hyperactive" | "mixed" | "undefined";

export function ChildForm({
  initialData,
  onSuccess,
}: {
  initialData?: Child | null;
  onSuccess: () => void;
}) {
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const setActiveChild = useUiStore((s) => s.setActiveChild);

  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? "");
  const [gender, setGender] = useState<string>(initialData?.gender ?? "");
  const [diagnosisType, setDiagnosisType] = useState<string>(
    initialData?.diagnosisType ?? "undefined"
  );

  const isPending = createChild.isPending || updateChild.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      birthDate,
      ...(gender && { gender: gender as Gender }),
      diagnosisType: diagnosisType as DiagnosisType,
    };

    if (isEdit && initialData) {
      updateChild.mutate(
        { id: initialData.id, ...payload },
        { onSuccess: () => onSuccess() }
      );
    } else {
      createChild.mutate(payload, {
        onSuccess: (data) => {
          setActiveChild(data.id);
          onSuccess();
        },
      });
    }
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
      {/* Birth date revealed once the parent has typed a name, or always in edit mode */}
      {(name.length > 0 || isEdit) && (
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
      )}
      {/* Optional details — collapsed by default in create mode, expanded on edit */}
      {(name.length > 0 || isEdit) && (
        <details className="group rounded-lg border border-border/60" open={isEdit}>
          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="transition-transform group-open:rotate-90">›</span>
              Détails optionnels
            </span>
          </summary>
          <div className="space-y-4 px-3 pb-3 pt-1">
            <div className="space-y-2">
              <Label htmlFor="child-gender">Genre</Label>
              <Select
                value={gender}
                onValueChange={(v) => v && setGender(v)}
                items={{ male: "Garçon", female: "Fille", other: "Autre" }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Non renseigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male" label="Garçon">Garçon</SelectItem>
                  <SelectItem value="female" label="Fille">Fille</SelectItem>
                  <SelectItem value="other" label="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-diagnosis">Type de diagnostic</Label>
              <Select
                value={diagnosisType}
                onValueChange={(v) => v && setDiagnosisType(v)}
                items={{ undefined: "Non défini", inattentive: "Inattentif", hyperactive: "Hyperactif", mixed: "Mixte" }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined" label="Non défini">Non défini</SelectItem>
                  <SelectItem value="inattentive" label="Inattentif">Inattentif</SelectItem>
                  <SelectItem value="hyperactive" label="Hyperactif">Hyperactif</SelectItem>
                  <SelectItem value="mixed" label="Mixte">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </details>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending
          ? (isEdit ? "Enregistrement..." : "Ajout...")
          : (isEdit ? "Enregistrer" : "Ajouter")}
      </Button>
    </form>
  );
}
