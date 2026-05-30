import { Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { PWAUpdatePrompt } from "@/components/shared/pwa-update-prompt";
import { useGoatCounterPageviews } from "@/lib/goatcounter";

export function RootLayout() {
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
