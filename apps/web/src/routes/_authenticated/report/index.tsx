import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLoader } from "@/components/ui/page-loader";
import { useReport, type Report } from "@/hooks/use-report";
import { useUiStore } from "@/stores/ui-store";
import { useChild } from "@/hooks/use-children";

export const Route = createFileRoute("/_authenticated/report/")({
  component: ReportPage,
});

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0]!,
    to: to.toISOString().split("T")[0]!,
  };
}

function ReportPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const defaults = getDefaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const { data: report, isLoading, isError } = useReport(
    activeChildId ?? "",
    from,
    to
  );

  if (!activeChildId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Sélectionnez un enfant pour générer un rapport.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Rapport médical
          </h1>
          <p className="text-muted-foreground">
            Export pour consultation médicale
          </p>
        </div>
        <Button onClick={() => window.print()} disabled={!report}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer / PDF
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 print:hidden">
        <div className="space-y-1">
          <Label htmlFor="from">Du</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to">Au</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            Erreur lors de la génération du rapport.
          </CardContent>
        </Card>
      ) : report ? (
        <ReportView report={report} />
      ) : null}
    </div>
  );
}

function ReportView({ report }: { report: Report }) {
  const statusLabels: Record<string, string> = {
    taken: "Pris",
    skipped: "Sauté",
    delayed: "Retardé",
  };

  return (
    <div className="space-y-6 print:space-y-4 print:text-sm">
      {/* Header */}
      <Card className="print:border-none print:shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{report.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Période : du{" "}
            {new Date(report.period.from).toLocaleDateString("fr-FR")} au{" "}
            {new Date(report.period.to).toLocaleDateString("fr-FR")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Enfant :</span>{" "}
            {report.child.name}
          </div>
          <div>
            <span className="text-muted-foreground">Naissance :</span>{" "}
            {new Date(report.child.birthDate).toLocaleDateString("fr-FR")}
          </div>
          <div>
            <span className="text-muted-foreground">Diagnostic :</span>{" "}
            {report.child.diagnosisType}
          </div>
        </CardContent>
      </Card>

      {/* Symptom Averages */}
      {report.symptoms.averages && (
        <Card className="print:border-none print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Moyennes des symptômes ({report.symptoms.entryCount} relevés)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 lg:grid-cols-7">
              {Object.entries(report.symptoms.averages).map(([key, value]) => (
                <div key={key}>
                  <div className="text-xl font-bold sm:text-2xl">{value}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {{
                      agitation: "Agitation",
                      focus: "Concentration",
                      impulse: "Impulsivité",
                      mood: "Régulation ém.",
                      sleep: "Sommeil",
                      social: "Comp. social",
                      autonomy: "Autonomie",
                    }[key] ?? key}
                  </div>
                  <div className="text-xs text-muted-foreground">/10</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      <Card className="print:border-none print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Traitements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.medications.active.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médicament</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Horaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.medications.active.map((med, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.dose}</TableCell>
                    <TableCell>{med.scheduledAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun traitement actif.
            </p>
          )}

          {report.medications.adherenceRate !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Taux d'observance :
              </span>
              <Badge
                variant={
                  report.medications.adherenceRate >= 80
                    ? "default"
                    : "destructive"
                }
              >
                {report.medications.adherenceRate}%
              </Badge>
              <span className="text-muted-foreground">
                ({report.medications.takenDoses}/{report.medications.totalDoses}{" "}
                prises)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symptom Detail Table */}
      {report.symptoms.entries.length > 0 && (
        <Card className="print:border-none print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Détail des symptômes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Agit.</TableHead>
                  <TableHead className="text-center">Conc.</TableHead>
                  <TableHead className="text-center">Imp.</TableHead>
                  <TableHead className="text-center">Rég.</TableHead>
                  <TableHead className="text-center">Som.</TableHead>
                  <TableHead className="text-center">Soc.</TableHead>
                  <TableHead className="text-center">Aut.</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.symptoms.entries.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {new Date(s.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-center">{s.agitation}</TableCell>
                    <TableCell className="text-center">{s.focus}</TableCell>
                    <TableCell className="text-center">{s.impulse}</TableCell>
                    <TableCell className="text-center">{s.mood}</TableCell>
                    <TableCell className="text-center">{s.sleep}</TableCell>
                    <TableCell className="text-center">{s.social}</TableCell>
                    <TableCell className="text-center">{s.autonomy}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {s.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Journal */}
      {report.journal.entries.length > 0 && (
        <Card className="print:border-none print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Journal ({report.journal.entryCount} entrées)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.journal.entries.map((j, i) => (
              <div key={i} className="border-b pb-2 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {new Date(j.date).toLocaleDateString("fr-FR")}
                  </span>
                  {j.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-1 text-sm text-foreground">{j.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground print:mt-8">
        Rapport généré le{" "}
        {new Date(report.generatedAt).toLocaleDateString("fr-FR")} à{" "}
        {new Date(report.generatedAt).toLocaleTimeString("fr-FR")} — Toko
      </p>
    </div>
  );
}
