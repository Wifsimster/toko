import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Brain,
  MessageCircle,
  Heart,
  GraduationCap,
  ClipboardList,
  Stethoscope,
  CircleDot,
  Pencil,
  Trash2,
  StickyNote,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { PageLoader } from "@/components/ui/page-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/use-appointments";
import { useUiStore } from "@/stores/ui-store";
import type { Appointment, AppointmentType } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsPage,
});

// ─── Type Configuration ─────────────────────────────────

type TypeConfig = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  iconBg: string;
  iconColor: string;
  border: string;
  heroBg: string;
};

const typeConfig: Record<AppointmentType, TypeConfig> = {
  neurologist: {
    label: "Neurologue",
    icon: Brain,
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/15",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    border: "border-l-indigo-400 dark:border-l-indigo-500",
    heroBg: "from-indigo-50/80 dark:from-indigo-950/20",
  },
  speech_therapist: {
    label: "Orthophoniste",
    icon: MessageCircle,
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    iconBg: "bg-violet-100 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    border: "border-l-violet-400 dark:border-l-violet-500",
    heroBg: "from-violet-50/80 dark:from-violet-950/20",
  },
  psychologist: {
    label: "Psychologue",
    icon: Heart,
    badge:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    iconBg: "bg-rose-100 dark:bg-rose-500/15",
    iconColor: "text-rose-600 dark:text-rose-400",
    border: "border-l-rose-400 dark:border-l-rose-500",
    heroBg: "from-rose-50/80 dark:from-rose-950/20",
  },
  school_pap: {
    label: "PAP (école)",
    icon: GraduationCap,
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    border: "border-l-amber-400 dark:border-l-amber-500",
    heroBg: "from-amber-50/80 dark:from-amber-950/20",
  },
  school_pps: {
    label: "PPS (école)",
    icon: ClipboardList,
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    iconBg: "bg-orange-100 dark:bg-orange-500/15",
    iconColor: "text-orange-600 dark:text-orange-400",
    border: "border-l-orange-400 dark:border-l-orange-500",
    heroBg: "from-orange-50/80 dark:from-orange-950/20",
  },
  pediatrician: {
    label: "Pédiatre",
    icon: Stethoscope,
    badge:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    iconBg: "bg-teal-100 dark:bg-teal-500/15",
    iconColor: "text-teal-600 dark:text-teal-400",
    border: "border-l-teal-400 dark:border-l-teal-500",
    heroBg: "from-teal-50/80 dark:from-teal-950/20",
  },
  other: {
    label: "Autre",
    icon: CircleDot,
    badge:
      "bg-stone-100 text-stone-700 dark:bg-stone-500/15 dark:text-stone-300",
    iconBg: "bg-stone-100 dark:bg-stone-500/15",
    iconColor: "text-stone-600 dark:text-stone-400",
    border: "border-l-stone-400 dark:border-l-stone-500",
    heroBg: "from-stone-50/80 dark:from-stone-950/20",
  },
};

function getTypeInfo(type: string): TypeConfig {
  return typeConfig[type as AppointmentType] ?? typeConfig.other;
}

// ─── Date Helpers ───────────────────────────────────────

function formatFullDate(date: Date): string {
  return format(date, "EEEE d MMMM yyyy", { locale: fr });
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

function formatShortDate(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return "Demain";
  return format(date, "EEE d MMM", { locale: fr });
}

function getCountdownLabel(date: Date): string {
  if (isToday(date)) return "aujourd'hui";
  if (isTomorrow(date)) return "demain";
  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return format(date, "d MMM", { locale: fr });
  if (days <= 7) return `dans ${days} jour${days > 1 ? "s" : ""}`;
  return formatDistanceToNow(date, { locale: fr, addSuffix: true });
}

// ─── Main Page Component ────────────────────────────────

function AppointmentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [editApt, setEditApt] = useState<Appointment | null>(null);
  const [deleteApt, setDeleteApt] = useState<Appointment | null>(null);

  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: appointments, isLoading } = useAppointments(
    activeChildId ?? "",
  );

  const now = new Date();
  const upcoming =
    appointments?.filter((a) => new Date(a.date) >= now) ?? [];
  const past =
    appointments?.filter((a) => new Date(a.date) < now).reverse() ?? [];
  const nextApt = upcoming[0];
  const restUpcoming = upcoming.slice(1);

  function handleEditFromDetail() {
    if (selectedApt) {
      setEditApt(selectedApt);
      setSelectedApt(null);
    }
  }

  function handleDeleteFromDetail() {
    if (selectedApt) {
      setDeleteApt(selectedApt);
      setSelectedApt(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rendez-vous</h1>
          <p className="text-muted-foreground">
            Calendrier des consultations médicales et scolaires
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
              <DialogDescription>
                Planifiez une consultation ou un rendez-vous scolaire.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Content ── */}
      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour voir ses rendez-vous.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !appointments?.length ? (
        <EmptyState onCreateClick={() => setCreateOpen(true)} />
      ) : (
        <>
          {/* Next appointment hero */}
          {nextApt && (
            <NextAppointmentHero
              appointment={nextApt}
              onClick={() => setSelectedApt(nextApt)}
            />
          )}

          {/* Remaining upcoming */}
          {restUpcoming.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  À venir ({restUpcoming.length})
                </h2>
              </div>
              <div className="space-y-2">
                {restUpcoming.map((apt, i) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    index={i}
                    onClick={() => setSelectedApt(apt)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past appointments */}
          {past.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground/60" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Passés ({past.length})
                </h2>
              </div>
              <div className="space-y-2">
                {past.map((apt, i) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    isPast
                    index={i}
                    onClick={() => setSelectedApt(apt)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Detail Dialog ── */}
      <AppointmentDetailDialog
        appointment={selectedApt}
        open={!!selectedApt}
        onOpenChange={(open) => !open && setSelectedApt(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editApt}
        onOpenChange={(open) => !open && setEditApt(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du rendez-vous.
            </DialogDescription>
          </DialogHeader>
          {editApt && (
            <AppointmentForm
              appointment={editApt}
              onSuccess={() => setEditApt(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <DeleteConfirmDialog
        appointment={deleteApt}
        open={!!deleteApt}
        onOpenChange={(open) => !open && setDeleteApt(null)}
      />
    </div>
  );
}

// ─── Next Appointment Hero ──────────────────────────────

function NextAppointmentHero({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick: () => void;
}) {
  const typeInfo = getTypeInfo(appointment.type);
  const TypeIcon = typeInfo.icon;
  const date = new Date(appointment.date);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full cursor-pointer text-left rounded-xl bg-card bg-gradient-to-br ${typeInfo.heroBg} ring-1 ring-foreground/10 p-5 transition-all duration-200 hover:ring-foreground/20 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prochain rendez-vous
          </span>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {getCountdownLabel(date)}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${typeInfo.iconBg}`}
        >
          <TypeIcon className={`h-6 w-6 ${typeInfo.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="font-heading text-lg font-semibold leading-tight">
              {appointment.title}
            </h3>
            <Badge className={`mt-1 ${typeInfo.badge}`}>
              {typeInfo.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="capitalize">{formatFullDate(date)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(date)}
            </span>
            {appointment.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.location}
              </span>
            )}
          </div>
          {appointment.notes && (
            <p className="line-clamp-1 text-sm text-muted-foreground/80">
              {appointment.notes}
            </p>
          )}
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

// ─── Appointment Card ───────────────────────────────────

function AppointmentCard({
  appointment,
  isPast,
  index,
  onClick,
}: {
  appointment: Appointment;
  isPast?: boolean;
  index: number;
  onClick: () => void;
}) {
  const typeInfo = getTypeInfo(appointment.type);
  const TypeIcon = typeInfo.icon;
  const date = new Date(appointment.date);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer text-left focus-visible:outline-none"
      style={{
        animation: "slide-up-fade 0.35s ease-out both",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Card
        className={`border-l-[3px] ${typeInfo.border} transition-all duration-200 hover:-translate-y-px hover:shadow-md ${
          isPast ? "opacity-50" : ""
        }`}
      >
        <CardContent className="flex items-center gap-3 py-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeInfo.iconBg}`}
          >
            <TypeIcon className={`h-4 w-4 ${typeInfo.iconColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-medium">{appointment.title}</h3>
              <Badge className={`shrink-0 text-xs ${typeInfo.badge}`}>
                {typeInfo.label}
              </Badge>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="capitalize">{formatShortDate(date)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(date)}
              </span>
              {appointment.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{appointment.location}</span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

// ─── Appointment Detail Dialog ──────────────────────────

function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!appointment) return null;

  const typeInfo = getTypeInfo(appointment.type);
  const TypeIcon = typeInfo.icon;
  const date = new Date(appointment.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${typeInfo.iconBg}`}
            >
              <TypeIcon className={`h-5 w-5 ${typeInfo.iconColor}`} />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {appointment.title}
              </DialogTitle>
              <Badge className={`mt-1 ${typeInfo.badge}`}>
                {typeInfo.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="capitalize">{formatFullDate(date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{formatTime(date)}</span>
          </div>
          {appointment.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{appointment.location}</span>
            </div>
          )}
          {appointment.notes && (
            <>
              <div className="border-t" />
              <div className="flex items-start gap-3 text-sm">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Supprimer
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Appointment Form ───────────────────────────────────

function AppointmentForm({
  onSuccess,
  appointment,
}: {
  onSuccess: () => void;
  appointment?: Appointment;
}) {
  const isEditing = !!appointment;
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const [title, setTitle] = useState(appointment?.title ?? "");
  const [type, setType] = useState<string>(appointment?.type ?? "neurologist");
  const [date, setDate] = useState(
    appointment ? format(new Date(appointment.date), "yyyy-MM-dd") : "",
  );
  const [time, setTime] = useState(
    appointment ? format(new Date(appointment.date), "HH:mm") : "09:00",
  );
  const [location, setLocation] = useState(appointment?.location ?? "");
  const [notes, setNotes] = useState(appointment?.notes ?? "");

  const isPending = isEditing
    ? updateAppointment.isPending
    : createAppointment.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !date) return;

    const dateTime = new Date(`${date}T${time}`).toISOString();

    if (isEditing && appointment) {
      updateAppointment.mutate(
        {
          id: appointment.id,
          childId: activeChildId,
          title,
          type: type as AppointmentType,
          date: dateTime,
          location: location || undefined,
          notes: notes || undefined,
        },
        { onSuccess },
      );
    } else {
      createAppointment.mutate(
        {
          childId: activeChildId,
          title,
          type: type as AppointmentType,
          date: dateTime,
          location: location || undefined,
          notes: notes || undefined,
        },
        { onSuccess },
      );
    }
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
        <Select
          value={type}
          onValueChange={(v) => v && setType(v)}
          items={Object.fromEntries(Object.entries(typeConfig).map(([k, v]) => [k, v.label]))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(typeConfig) as [AppointmentType, TypeConfig][]
            ).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <SelectItem key={key} value={key} label={config.label}>
                  <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
                  <span>{config.label}</span>
                </SelectItem>
              );
            })}
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
        disabled={!activeChildId || isPending}
      >
        {isPending
          ? "Enregistrement..."
          : isEditing
            ? "Enregistrer"
            : "Ajouter"}
      </Button>
    </form>
  );
}

// ─── Delete Confirmation Dialog ─────────────────────────

function DeleteConfirmDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteAppointment = useDeleteAppointment();

  function handleDelete() {
    if (!appointment) return;
    deleteAppointment.mutate(
      { id: appointment.id, childId: appointment.childId },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  if (!appointment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le rendez-vous ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le rendez-vous &laquo;&nbsp;{appointment.title}&nbsp;&raquo; sera
            définitivement supprimé. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteAppointment.isPending}
          >
            {deleteAppointment.isPending ? "Suppression..." : "Supprimer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Empty State ────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-50/50 to-transparent dark:from-accent-950/10" />
      <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-100 dark:bg-accent-900/30">
          <CalendarDays className="h-8 w-8 text-accent-500" />
        </div>
        <div className="relative space-y-2">
          <h3 className="font-heading text-lg font-semibold">
            Aucun rendez-vous planifié
          </h3>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Commencez par ajouter le prochain rendez-vous médical ou scolaire
            de votre enfant.
          </p>
        </div>
        <Button onClick={onCreateClick} className="relative">
          <Plus className="mr-2 h-4 w-4" />
          Planifier un rendez-vous
        </Button>
      </CardContent>
    </Card>
  );
}
