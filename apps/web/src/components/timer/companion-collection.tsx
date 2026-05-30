import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCompanions } from "@/hooks/use-companions";
import { critterById, type Critter } from "./critters";

// "Mes compagnons" — a calm memory book of animals the child has already
// met. By design it shows ONLY discovered companions: no locked slots, no
// "x / total" counter, no rarity. A grid of empty slots would turn a quiet
// focus tool into a collection chore, which is the opposite of what an
// ADHD child needs from the timer.
export function CompanionCollection({
  childId,
  open,
  onOpenChange,
  justDiscoveredId,
}: {
  childId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A companion revealed in this session — shown even before the list refetches. */
  justDiscoveredId?: string | null;
}) {
  const { t } = useTranslation();
  const { data: discoveries, isLoading } = useCompanions(childId);

  // Discovered critters, most recent first. The just-revealed companion is
  // merged in so it always appears the instant the child opens the dialog,
  // without waiting for the network round-trip to complete.
  const discovered = useMemo<Critter[]>(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    if (justDiscoveredId) {
      seen.add(justDiscoveredId);
      ids.push(justDiscoveredId);
    }
    for (const d of discoveries ?? []) {
      if (!seen.has(d.animalId)) {
        seen.add(d.animalId);
        ids.push(d.animalId);
      }
    }
    return ids
      .map((id) => critterById(id))
      .filter((c): c is Critter => c !== undefined);
  }, [discoveries, justDiscoveredId]);

  const loading = isLoading && discovered.length === 0;
  const empty = !loading && discovered.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {t("timer.collection.title")}
          </DialogTitle>
          <DialogDescription>
            {empty
              ? t("timer.collection.empty")
              : t("timer.collection.intro", { count: discovered.length })}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {empty && (
          <p
            className="py-6 text-center text-5xl"
            aria-hidden="true"
          >
            🥚
          </p>
        )}

        {!loading && !empty && (
          <ul className="grid grid-cols-3 gap-3">
            {discovered.map((critter) => {
              const isNew = critter.id === justDiscoveredId;
              const name = t(`critters.${critter.id}`);
              return (
                <li
                  key={critter.id}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border bg-background p-3 text-center",
                    isNew
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border/60",
                  )}
                >
                  <span className="text-4xl" aria-hidden="true">
                    {critter.emoji}
                  </span>
                  <span
                    className={cn(
                      "text-xs leading-tight",
                      isNew
                        ? "font-medium text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {name}
                  </span>
                  {isNew && (
                    <span className="text-[0.65rem] font-medium uppercase tracking-wide text-primary">
                      {t("timer.collection.new")}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !empty && (
          <p className="text-center text-xs text-muted-foreground">
            {t("timer.collection.hint")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
