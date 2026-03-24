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
import { useCreateChild } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";

const RANDOM_FIRSTNAMES = [
  "Petit Loup", "Étoile", "Chouette", "Papillon", "Ourson",
  "Luciole", "Panda", "Colibri", "Renardeau", "Coccinelle",
  "Doudou", "Câlin", "Perle", "Nuage", "Soleil",
];

function getRandomFirstname() {
  return RANDOM_FIRSTNAMES[Math.floor(Math.random() * RANDOM_FIRSTNAMES.length)]!;
}

export function AddChildForm({ onSuccess }: { onSuccess: () => void }) {
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
