import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { JournalCard } from "@/components/journal/journal-card";
import { JournalForm } from "@/components/journal/journal-form";
import { useJournal } from "@/hooks/use-journal";
import { useUiStore } from "@/stores/ui-store";
import { FeatureTip } from "@/components/shared/feature-tip";

export const Route = createFileRoute("/_authenticated/journal/")({
  component: JournalPage,
});

function JournalPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: entries, isLoading } = useJournal(activeChildId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Journal</h1>
          <p className="text-muted-foreground">
            Notes et observations quotidiennes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Écrire
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle entrée</DialogTitle>
            </DialogHeader>
            <JournalForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <FeatureTip feature="journal" />

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour voir son journal.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !entries?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Votre journal est vide. Commencez à écrire vos premières
              observations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
