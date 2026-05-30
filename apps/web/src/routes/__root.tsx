import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { NotFound } from "@/components/not-found";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { PWAUpdatePrompt } from "@/components/shared/pwa-update-prompt";
import { useGoatCounterPageviews } from "@/lib/goatcounter";
import { RootErrorBoundary } from "./root-error-boundary";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
});

function RootLayout() {
  useGoatCounterPageviews();
  return (
    <>
      <Outlet />
      <Toaster />
      <InstallPrompt />
      <PWAUpdatePrompt />
    </>
  );
}
