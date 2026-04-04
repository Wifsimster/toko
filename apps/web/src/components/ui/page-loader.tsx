import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader() {
  return (
    <div
      data-slot="page-loader"
      className="space-y-4 py-6"
      role="status"
      aria-label="Chargement en cours"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <span className="sr-only">Chargement en cours…</span>
    </div>
  );
}
