import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  useAppointments,
  useCreateAppointment,
} from "@/hooks/use-appointments";
import { useUiStore } from "@/stores/ui-store";
import type { Appointment, AppointmentType } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsPage,
});

const typeLabels: Record<AppointmentType, { label: string; color: string }> = {
  neurologist: { label: "Neurologue", color: "bg-blue-100 text-blue-800" },
  speech_therapist: {
    label: "Orthophoniste",
    color: "bg-purple-100 text-purple-800",
  },
  psychologist: {
    label: "Psychologue",
    color: "bg-indigo-100 text-indigo-800",
  },
  school_pap: { label: "PAP (école)", color: "bg-amber-100 text-amber-800" },
  school_pps: { label: "PPS (école)", color: "bg-orange-100 text-orange-800" },
  pediatrician: { label: "Pédiatre", color: "bg-emerald-100 text-emerald-800" },
  other: { label: "Autre", color: "bg-gray-100 text-gray-800" },
};

function AppointmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: appointments, isLoading } = useAppointments(
    activeChildId ?? ""
  );

  const now = new Date();
  const upcoming =
    appointments?.filter((a) => new Date(a.date) >= now) ?? [];
  const past =
    appointments?.filter((a) => new Date(a.date) < now).reverse() ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rendez-vous</h1>
          <p className="text-muted-foreground">
            Calendrier des consultations médicales et scolaires
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau RDV
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau rendez-vous</DialogTitle>
            </DialogHeader>
            <AppointmentForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour voir ses rendez-vous.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !appointments?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Aucun rendez-vous planifié. Ajoutez votre prochain RDV.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">À venir</h2>
              {upcoming.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Passés
              </h2>
              {past.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  isPast
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment,
  isPast,
}: {
  appointment: Appointment;
  isPast?: boolean;
}) {
  const typeInfo =
    typeLabels[appointment.type as AppointmentType] ?? typeLabels.other;
  const date = new Date(appointment.date);

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardContent className="flex items-start gap-4 py-4">
        <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-2 text-center">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {date.toLocaleDateString("fr-FR", { month: "short" })}
          </span>
          <span className="text-2xl font-bold">{date.getDate()}</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{appointment.title}</h3>
            <Badge className={`text-xs ${typeInfo.color}`}>
              {typeInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {date.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {appointment.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.location}
              </span>
            )}
          </div>
          {appointment.notes && (
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentForm({ onSuccess }: { onSuccess: () => void }) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createAppointment = useCreateAppointment();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("neurologist");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !date) return;

    const dateTime = new Date(`${date}T${time}`).toISOString();

    createAppointment.mutate(
      {
        childId: activeChildId,
        title,
        type: type as AppointmentType,
        date: dateTime,
        location: location || undefined,
        notes: notes || undefined,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apt-title">Titre</Label>
        <Input
          id="apt-title"
          placeholder="Ex: Consultation Dr. Martin"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apt-type">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(typeLabels) as [AppointmentType, { label: string }][]
            ).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="apt-date">Date</Label>
          <Input
            id="apt-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apt-time">Heure</Label>
          <Input
            id="apt-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="apt-location">Lieu</Label>
        <Input
          id="apt-location"
          placeholder="Adresse ou cabinet"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apt-notes">Notes</Label>
        <Textarea
          id="apt-notes"
          placeholder="Informations complémentaires..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || createAppointment.isPending}
      >
        {createAppointment.isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}
