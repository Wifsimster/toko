import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  StrengthCard,
  categoryConfig,
} from "@/components/strengths/strength-card";
import { StrengthForm } from "@/components/strengths/strength-form";
import {
  useStrengths,
  useDeleteStrength,
} from "@/hooks/use-strengths";
import { useUiStore } from "@/stores/ui-store";
import type { Strength, StrengthCategory } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/strengths/")({
  component: StrengthsPage,
  staticData: {
    crumb: "nav.strengths",
  },
});

const CATEGORY_FILTER_OPTIONS: StrengthCategory[] = [
  "talent",
  "achievement",
  "quality",
  "progress",
];

function StrengthsPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: strengths, isLoading } = useStrengths(activeChildId ?? "");
  const deleteStrength = useDeleteStrength();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Strength | null>(null);
  const [deleting, setDeleting] = useState<Strength | null>(null);
  const [filter, setFilter] = useState<StrengthCategory | "all">("all");

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Strength) => {
    setEditing(s);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const filtered = useMemo(() => {
    if (!strengths) return [];
    if (filter === "all") return strengths;
    return strengths.filter((s) => s.category === filter);
  }, [strengths, filter]);

  const handleDelete = () => {
    if (!deleting || !activeChildId) return;
    deleteStrength.mutate(
      { id: deleting.id, childId: activeChildId },
      {
        onSuccess: () => {
          toast.success(t("strengths.deletedToast"));
          setDeleting(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("strengths.title")}
        description={t("strengths.subtitle")}
        actions={
          <Button onClick={openCreate} disabled={!activeChildId}>
            <Plus className="mr-2 h-4 w-4" />
            {t("strengths.addButton")}
          </Button>
        }
      />

      {strengths && strengths.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            {t("strengths.filterAll")}
          </Badge>
          {CATEGORY_FILTER_OPTIONS.map((c) => (
            <Badge
              key={c}
              variant={filter === c ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter(c)}
            >
              <span className="mr-1" aria-hidden="true">
                {categoryConfig[c].fallbackEmoji}
              </span>
              {t(categoryConfig[c].labelKey)}
            </Badge>
          ))}
        </div>
      )}

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("strengths.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !strengths?.length ? (
        <Card className="bg-accent-50/40 ring-1 ring-accent-200/60 dark:bg-accent-900/20 dark:ring-accent-800/60">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Sparkles className="h-10 w-10 text-accent-500" />
            <p className="font-heading text-lg font-semibold">
              {t("strengths.emptyTitle")}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("strengths.emptyBody")}
            </p>
            <Button onClick={openCreate} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              {t("strengths.emptyCta")}
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("strengths.noMatch")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter("all")}
            >
              {t("strengths.clearFilter")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((strength) => (
            <StrengthCard
              key={strength.id}
              strength={strength}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="sm:max-w-lg">
          <StrengthForm
            key={editing?.id ?? "create"}
            initialData={editing}
            onSuccess={closeForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("strengths.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("strengths.deleteBodyPrefix")}{" "}
            <strong className="text-foreground">{deleting?.title}</strong>{" "}
            {t("strengths.deleteBodySuffix")}
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("strengths.cancel")}
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteStrength.isPending}
            >
              {deleteStrength.isPending
                ? t("strengths.deleting")
                : t("strengths.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
