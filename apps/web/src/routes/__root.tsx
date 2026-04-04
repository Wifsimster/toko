import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { NotFound } from "@/components/not-found";
import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
});

function RootErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
        <p className="mt-2 text-muted-foreground">
          {error.message || "Quelque chose s'est mal passé."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.invalidate()}>
            Réessayer
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
