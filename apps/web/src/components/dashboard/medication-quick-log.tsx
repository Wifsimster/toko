import { Pill, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useMedicationAdherence,
  useLogMedication,
} from "@/hooks/use-medications";
import { todayISO } from "@/lib/date";

export function MedicationQuickLog({ childId }: { childId: string }) {
  const { data } = useMedicationAdherence(childId);
  const logMedication = useLogMedication();

  const meds = data?.medications ?? [];
  if (meds.length === 0) return null;

  const handleLog = (medicationId: string, taken: boolean) => {
    logMedication.mutate({
      medicationId,
      childId,
      date: todayISO(),
      taken,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Pill className="h-4 w-4 text-muted-foreground" />
          Traitement du jour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {meds.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{med.name}</p>
              <p className="text-xs text-muted-foreground">
                {med.dose ? `${med.dose} · ` : ""}
                {med.adherenceRate !== null
                  ? `${med.adherenceRate}% sur 30 j (${med.takenCount}/${med.loggedCount})`
                  : "Aucune prise enregistrée"}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                type="button"
                variant={med.todayTaken === true ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Prise validée"
                onClick={() => handleLog(med.id, true)}
                disabled={logMedication.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={med.todayTaken === false ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Prise manquée"
                onClick={() => handleLog(med.id, false)}
                disabled={logMedication.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
